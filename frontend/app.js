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
    let container = document.getElementById('customToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'customToastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type} fade-in`;
    toast.innerHTML = `
        <div style="font-size: 2.5rem; line-height: 1;">${type === 'success' ? '🚀' : '💥'}</div>
        <div style="flex-grow:1;">
            <div class="toast-content-title">${title}</div>
            <div class="toast-content-msg">${message}</div>
        </div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => { toast.classList.add('show'); }, 50);
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 400);
    }, 4500);
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
            const toastEl = document.getElementById('statusToast');
            const toastMsg = document.getElementById('toastMessage');
            if (toastEl && toastMsg) {
                toastMsg.innerText = `PO #${data.po_id} has been marked as ${data.status}!`;
                if (data.status === 'Completed') {
                    toastEl.className = 'toast text-bg-success border-0';
                    toastEl.querySelector('.toast-header').className = 'toast-header bg-success text-white border-0';
                } else if (data.status === 'Approved') {
                    toastEl.className = 'toast text-bg-primary border-0';
                    toastEl.querySelector('.toast-header').className = 'toast-header bg-primary text-white border-0';
                }
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            }
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
        const tbody = document.getElementById('po-table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        if(data.length === 0) {
             tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">No Purchase Orders Found</td></tr>';
             return;
        }
        data.forEach(po => {
            let nextAction = "";
            if (po.status === 'Pending') {
                nextAction = `<button class="btn-gamified btn-secondary-gamified" style="padding: 10px 20px; font-size: 1rem;" onclick="updatePOStatus(${po.id}, 'Approved', this)">👍 Approve</button>`;
            } else if (po.status === 'Approved') {
                nextAction = `<button class="btn-gamified btn-success-gamified" style="padding: 10px 20px; font-size: 1rem;" onclick="updatePOStatus(${po.id}, 'Completed', this)">🚚 Ship It!</button>`;
            } else if (po.status === 'Completed') {
                nextAction = `<span class="badge-gamified badge-completed border-0">🏆 DONE</span>`;
            } else {
                 nextAction = `<span class="badge-gamified badge-pending border-0">🔒 LOCKED</span>`;
            }
            
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold" style="color: var(--primary);">#${po.ref_no}</td>
                    <td>🏢 VND-${po.vendor_id}</td>
                    <td class="fw-bold text-success">💰 $${po.total_amount.toFixed(2)}</td>
                    <td class="text-muted">💸 $${po.tax_amount.toFixed(2)}</td>
                    <td><span class="badge-gamified ${po.status === 'Completed' ? 'badge-completed' : (po.status === 'Approved' ? 'badge-approved' : 'badge-pending')} status-badge-${po.id}">${po.status === 'Pending'? '⏳': (po.status === 'Approved'? '✅':'🌟')} ${po.status}</span></td>
                    <td class="text-end action-cell-${po.id}">${nextAction}</td>
                </tr>
            `;
        });
    } catch(e) {
        console.error("Failed to fetch POs", e);
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
    if (btnElement) {
        btnElement.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
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
            fetchPOs(); // refresh the list
        } else {
            showNotification("Action Failed", "Failed to update status", "error");
            if (btnElement) {
                btnElement.innerHTML = "Retry";
                btnElement.disabled = false;
            }
        }
    } catch(e) {
        console.error(e);
        showNotification("Network Error", "Error updating status", "error");
        if (btnElement) {
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
        options += `<option value="${p.id}" data-price="${p.unit_price}">${p.name} ($${p.unit_price})</option>`;
    });

    const rowHtml = `
        <div class="row mb-4 align-items-end" id="row-${rowCount}">
            <div class="col-md-3">
                <label class="label-gamified">📦 Product</label>
                <select class="input-bouncy product-select" required onchange="handleProductSelect(this, ${rowCount})">
                    ${options}
                </select>
            </div>
            <div class="col-md-2 mt-3 mt-md-0">
                <label class="label-gamified">🏷️ SKU</label>
                <input type="text" class="input-bouncy product-sku" readonly placeholder="Auto-fill">
            </div>
            <div class="col-md-2 mt-3 mt-md-0">
                <label class="label-gamified">💵 Unit Price</label>
                <input type="text" class="input-bouncy product-price" readonly placeholder="$0.00">
            </div>
            <div class="col-md-2 mt-3 mt-md-0">
                <label class="label-gamified">🔢 Qty</label>
                <input type="number" class="input-bouncy product-qty" min="1" value="1" required oninput="updateTotals()">
            </div>
            <div class="col-md-3 mt-3 mt-md-0 d-flex gap-3">
                <div class="w-100">
                    <label class="label-gamified">💳 Line Total</label>
                    <input type="text" class="input-bouncy border-0 fw-bold line-total px-0" style="color: var(--primary); background: transparent; pointer-events: none;" readonly value="$0.00">
                </div>
                <button type="button" class="btn-gamified btn-danger-gamified" style="margin-top: 36px; padding: 15px 20px; width: unset;" onclick="removeRow(${rowCount})">🗑️</button>
            </div>
        </div>
    `;
    const container = document.getElementById('product-rows-container');
    if (container) container.insertAdjacentHTML('beforeend', rowHtml);
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
    document.getElementById(`row-${id}`).remove();
    updateTotals();
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
    
    const etax = document.getElementById('est-tax');
    const etot = document.getElementById('est-total');
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
    btn.innerHTML = 'Placing Order...';
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
            showNotification("Success", "Purchase Order securely generated!", "success");
            window.location.href = 'index.html';
        } else {
            const err = await res.json();
            showNotification("Creation Denied", err.detail || "Unknown constraint", "error");
        }
    } catch(e) {
        console.error(e);
        showNotification("Network Error", "Could not submit PO to server.", "error");
    } finally {
        btn.innerHTML = 'Confirm & Place Order';
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
    btn.innerHTML = 'Saving...';
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
            document.getElementById('saved-product-id').value = prod.id;
            btn.innerText = "Saved Successfully ✓";
            btn.classList.replace('btn-dark', 'btn-success');
        } else {
            const err = await res.json();
            showNotification("Save Failed", err.detail || "Unknown error", "error");
            btn.innerHTML = 'Save Product';
            btn.disabled = false;
        }
    } catch(e) { console.error(e); }
});

async function draftAIDescription() {
    const nameVal = document.getElementById('p-name')?.value;
    if(!nameVal || nameVal.trim() === "") return;
    
    const descBox = document.getElementById('p-desc');
    descBox.value = "✨ AI is thinking...";
    
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
            descBox.value = "Failed to generate description.";
        }
    } catch(e) {
        console.error(e);
        descBox.value = "Error contacting AI service.";
    }
}
