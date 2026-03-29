const API_PYTHON = 'http://localhost:8080/api';

function checkAuth() {
    if (!window.location.pathname.endsWith("login.html") && !localStorage.getItem("jwt")) {
        window.location.href = "login.html";
    }
}
checkAuth();

function logout() {
    localStorage.removeItem("jwt");
    window.location.href = "login.html";
}

function showNotification(title, message, type='success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-8 right-8 z-50 flex flex-col gap-4';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-white' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-slate-200' : 'border-red-100';
    const iconColor = type === 'success' ? 'text-emerald-500' : 'text-red-500';
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';

    toast.className = `flex items-center gap-4 p-4 rounded-xl border ${borderColor} ${bgColor} shadow-lg min-w-[320px] transform transition-all duration-300 translate-x-full opacity-0`;
    toast.innerHTML = `
        <div class="${iconColor}">
            <i data-lucide="${icon}" class="w-6 h-6"></i>
        </div>
        <div class="flex-grow">
            <div class="text-sm font-bold text-slate-900">${title}</div>
            <div class="text-xs text-slate-500">${message}</div>
        </div>
        <button class="text-slate-400 hover:text-slate-600" onclick="this.parentElement.remove()">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => { 
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    setTimeout(() => { 
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

let cachedProducts = [];

async function loginWithGoogle() {
    try {
        const res = await fetch(`${API_PYTHON}/auth/google`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token: 'mock_google_token'})
        });
        const data = await res.json();
        localStorage.setItem("jwt", data.access_token);
        window.location.href = "index.html";
    } catch(e) {
        console.error("Login failed", e);
        showNotification("Login Failed", "Could not connect to authentication server.", "error");
    }
}

function getAuthHeader() {
    const token = localStorage.getItem("jwt");
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function initWebSocket() {
    if (!localStorage.getItem("jwt")) return;
    if (typeof io !== 'undefined') {
        const socket = io('http://localhost:3000');
        socket.on('connect', () => { console.log('Connected to Real-Time Notification Server'); });
        socket.on('po-status-update', (data) => {
            console.log('Received PO Update!', data);
            showNotification(`PO #${data.po_id} Updated`, `Status changed to ${data.status}`, "success");
            if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
                fetchPOs();
            }
        });
    } else {
        console.log("Socket.io not loaded.");
    }
}

async function fetchPOs() {
    try {
        const res = await fetch(`${API_PYTHON}/pos`, { headers: getAuthHeader() });
        if (res.status === 401) return logout();
        const data = await res.json();
        
        // Ensure data is an array
        const poList = Array.isArray(data) ? data : [];
        
        // Update stats
        const totalValue = poList.reduce((acc, po) => acc + po.total_amount, 0);
        const pendingCount = poList.filter(po => po.status === 'Pending').length;
        
        const statTotal = document.getElementById('stat-total-orders');
        const statPending = document.getElementById('stat-pending-orders');
        const statValue = document.getElementById('stat-total-value');
        
        if (statTotal) statTotal.innerText = poList.length;
        if (statPending) statPending.innerText = pendingCount;
        if (statValue) statValue.innerText = `$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        const tbody = document.getElementById('po-table-body');
        if(!tbody) return;
        
        tbody.innerHTML = '';
        if(poList.length === 0) {
             tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-slate-400">No Purchase Orders Found</td></tr>';
             return;
        }
        poList.forEach(po => {
            let statusClass = "bg-slate-100 text-slate-600";
            if (po.status === 'Approved') statusClass = "bg-blue-50 text-blue-700 border-blue-100";
            if (po.status === 'Completed') statusClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
            if (po.status === 'Pending') statusClass = "bg-amber-50 text-amber-700 border-amber-100";

            let nextAction = "";
            if (po.status === 'Pending') {
                nextAction = `<button class="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors" onclick="updatePOStatus(${po.id}, 'Approved', this)">Approve</button>`;
            } else if (po.status === 'Approved') {
                nextAction = `<button class="text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-colors" onclick="updatePOStatus(${po.id}, 'Completed', this)">Ship Order</button>`;
            } else {
                nextAction = `<span class="text-slate-400 text-sm">No actions</span>`;
            }
            
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-mono text-sm text-blue-600 font-semibold">#${po.ref_no}</td>
                    <td class="px-6 py-4 text-slate-600 text-sm font-medium">Vendor ${po.vendor_id}</td>
                    <td class="px-6 py-4 font-bold text-slate-900">$${po.total_amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-slate-500 text-sm">$${po.tax_amount.toFixed(2)}</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusClass}">
                            ${po.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">${nextAction}</td>
                </tr>
            `;
        });
        lucide.createIcons();
    } catch(e) {
        console.error("Failed to fetch POs", e);
        showNotification("Fetch Failed", "Could not load purchase orders.", "error");
    }
}

async function loadVendors() {
    try {
        const res = await fetch(`${API_PYTHON}/vendors`, { headers: getAuthHeader() });
        if (res.status === 401) return logout();
        const data = await res.json();
        
        const sel = document.getElementById('vendor-select');
        if(!sel) return;
        sel.innerHTML = '<option value="">Select Vendor...</option>';
        data.forEach(v => {
            sel.innerHTML += `<option value="${v.id}">${v.name}</option>`;
        });
    } catch(e) {
        console.error("Failed to load vendors", e);
    }
}

async function updatePOStatus(poId, newStatus, btnElement) {
    const originalContent = btnElement.innerHTML;
    if (btnElement) {
        btnElement.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span> Updating...`;
        btnElement.disabled = true;
    }
    try {
        const res = await fetch(`${API_PYTHON}/pos/${poId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.status === 401) return logout();
        if (res.ok) {
            showNotification("Status Updated", `PO #${poId} is now ${newStatus}`, "success");
            fetchPOs();
        } else {
            showNotification("Update Failed", "Failed to update PO status.", "error");
            if (btnElement) {
                btnElement.innerHTML = originalContent;
                btnElement.disabled = false;
            }
        }
    } catch(e) {
        console.error(e);
        showNotification("Network Error", "Error updating status", "error");
        if (btnElement) {
             btnElement.innerHTML = originalContent;
             btnElement.disabled = false;
        }
    }
}

async function loadProductsList() {
    try {
        const res = await fetch(`${API_PYTHON}/products`, { headers: getAuthHeader() });
        if (res.status === 401) return logout();
        cachedProducts = await res.json();
    } catch(e) {
        console.error("Failed to fetch products", e);
    }
}

let rowCount = 0;
function addProductRow() {
    rowCount++;
    let options = '<option value="">Select a Product</option>';
    cachedProducts.forEach(p => {
        options += `<option value="${p.id}" data-price="${p.unit_price}">${p.name}</option>`;
    });

    const rowHtml = `
        <tr class="hover:bg-slate-50 transition-colors group" id="row-${rowCount}">
            <td class="px-6 py-4">
                <select class="product-select w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required onchange="handleProductSelect(this, ${rowCount})">
                    ${options}
                </select>
            </td>
            <td class="px-6 py-4">
                <input type="text" class="product-sku w-full bg-slate-50 border-0 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed" readonly placeholder="---">
            </td>
            <td class="px-6 py-4">
                <input type="text" class="product-price w-full bg-slate-50 border-0 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed" readonly placeholder="$0.00">
            </td>
            <td class="px-6 py-4">
                <input type="number" class="product-qty w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" min="1" value="1" required oninput="updateTotals()">
            </td>
            <td class="px-6 py-4">
                <input type="text" class="line-total w-full bg-transparent border-0 font-bold text-slate-900 text-sm px-0 cursor-not-allowed" readonly value="$0.00">
            </td>
            <td class="px-6 py-4 text-right">
                <button type="button" onclick="removeRow(${rowCount})" class="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </td>
        </tr>
    `;
    const container = document.getElementById('product-rows-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', rowHtml);
        lucide.createIcons();
    }
}

function handleProductSelect(selectElement, rowId) {
    const row = document.getElementById(`row-${rowId}`);
    const selectedOption = selectElement.selectedOptions[0];
    const skuInput = row.querySelector('.product-sku');
    const priceInput = row.querySelector('.product-price');
    
    if (selectedOption && selectedOption.value) {
        const prodId = parseInt(selectedOption.value);
        const prod = cachedProducts.find(p => p.id === prodId);
        if (prod) {
            skuInput.value = prod.sku;
            priceInput.value = `$${prod.unit_price.toFixed(2)}`;
            selectElement.dataset.price = prod.unit_price;
        }
    } else {
        skuInput.value = "";
        priceInput.value = "";
        delete selectElement.dataset.price;
    }
    updateTotals();
}

function removeRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
        row.remove();
        updateTotals();
    }
}

function updateTotals() {
    let rawTotal = 0;
    document.querySelectorAll('[id^="row-"]').forEach(row => {
        const sel = row.querySelector('.product-select');
        const qty = parseInt(row.querySelector('.product-qty').value) || 0;
        const lineTotalInput = row.querySelector('.line-total');
        
        let price = 0;
        if(sel && sel.selectedOptions[0] && sel.selectedOptions[0].dataset.price) {
            price = parseFloat(sel.selectedOptions[0].dataset.price);
        }
        
        const lineVal = price * qty;
        rawTotal += lineVal;
        lineTotalInput.value = `$${lineVal.toFixed(2)}`;
    });
    
    const tax = rawTotal * 0.05;
    const finalTotal = rawTotal + tax;
    
    const esub = document.getElementById('est-subtotal');
    const etax = document.getElementById('est-tax');
    const etot = document.getElementById('est-total');
    
    if(esub) esub.innerText = `$${rawTotal.toFixed(2)}`;
    if(etax) etax.innerText = `$${tax.toFixed(2)}`;
    if(etot) etot.innerText = `$${finalTotal.toFixed(2)}`;
}

document.getElementById('create-po-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const vendorId = document.getElementById('vendor-select').value;
    const items = [];
    document.querySelectorAll('[id^="row-"]').forEach(row => {
        const prodId = row.querySelector('.product-select').value;
        const qty = row.querySelector('.product-qty').value;
        if(prodId && qty) {
            items.push({product_id: parseInt(prodId), quantity: parseInt(qty)});
        }
    });
    
    if(items.length === 0) return showNotification("Validation", "Please add at least one product.", "error");
    
    const payload = { vendor_id: parseInt(vendorId), items: items };
    const refNoVal = document.getElementById('po-ref-no')?.value;
    if (refNoVal && refNoVal.trim() !== "") {
        payload.ref_no = refNoVal.trim();
    }
    
    const btn = document.getElementById('submit-po-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> Processing...`;
    btn.disabled = true;
    try {
        const res = await fetch(`${API_PYTHON}/pos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(payload)
        });
        if (res.status === 401) return logout();
        if(res.ok) {
            showNotification("Success", "Purchase Order has been created successfully.", "success");
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            const err = await res.json();
            showNotification("Creation Failed", err.detail || "Unable to create purchase order.", "error");
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    } catch(e) {
        console.error(e);
        showNotification("Network Error", "Could not submit PO to server.", "error");
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});

document.getElementById('create-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('p-name').value,
        sku: document.getElementById('p-sku').value,
        unit_price: parseFloat(document.getElementById('p-price').value),
        stock_level: parseInt(document.getElementById('p-stock').value),
        description: document.getElementById('p-desc').value
    };
    const btn = document.getElementById('save-product-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> Saving...`;
    btn.disabled = true;
    try {
        const res = await fetch(`${API_PYTHON}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(payload)
        });
        if (res.status === 401) return logout();
        if(res.ok) {
            const prod = await res.json();
            showNotification("Product Saved", `${prod.name} added to catalog.`, "success");
            btn.innerText = "Saved Successfully ✓";
            btn.className = "w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2";
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.className = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2";
                btn.disabled = false;
                document.getElementById('create-product-form').reset();
            }, 3000);
        } else {
            const err = await res.json();
            showNotification("Save Failed", err.detail || "Unknown error", "error");
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    } catch(e) { 
        console.error(e);
        showNotification("Network Error", "Could not save product.", "error");
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});

async function draftAIDescription() {
    const nameVal = document.getElementById('p-name')?.value;
    if(!nameVal || nameVal.trim() === "") return;
    
    const descBox = document.getElementById('p-desc');
    descBox.placeholder = "AI is thinking...";
    
    try {
        const res = await fetch(`${API_PYTHON}/products/draft-description`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ name: nameVal })
        });
        if (res.status === 401) return logout();
        if(res.ok) {
            const data = await res.json();
            descBox.value = data.description;
        } else {
            descBox.placeholder = "Failed to generate description.";
        }
    } catch(e) {
        console.error(e);
        descBox.placeholder = "Error contacting AI service.";
    }
}
