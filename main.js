
function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#4f46e5";
    toast.style.color = "white";
    toast.style.padding = "15px 25px";
    toast.style.borderRadius = "10px";
    toast.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
    toast.style.zIndex = "9999";
    toast.style.fontFamily = "sans-serif";
    toast.style.fontWeight = "bold";
    toast.style.transition = "opacity 0.5s";

    document.body.appendChild(toast);

    setTimeout(() => toast.style.opacity = "0", 2500);
    setTimeout(() => toast.remove(), 3000);
}

const data = {
    identity : ["Birth Certificate", "National ID Card", "Family Record Book", "Passport"],
    work:["Employment Contract", "Salary Slip", "Pension Card", "Resume / CV"],
    finance: ["Bank Statement", "Credit Card", "Loans", "Investments"],
    health:["Health Insurance", "Medical Tests", "Vaccines", "Medical Records"],
};

const colors = {
    identity : 'var(--c1)', 
    work: 'var(--c2)', 
    finance: 'var(--c3)', 
    health: 'var(--c4)' 
};

function openFolder(key) {
    const folderTitles = {
        identity: "Personal Identity",
        work: "Work & Career",
        finance: "Finance & Banking",
        health: "Health & Family"
    };

    const title = folderTitles[key];

    if (document.startViewTransition) {
        document.startViewTransition(() => renderDocs(key, title));
    } else {
        renderDocs(key, title);
    }
}

function renderDocs(key, title) {
    const grid = document.getElementById('main-grid');

    document.getElementById('view-title').innerText = title;
    document.getElementById('back-btn').classList.remove('hidden');

    grid.style.display = "block";
    grid.innerHTML = `<div class="sub-grid"></div>`;

    const subGrid = grid.querySelector('.sub-grid');

    data[key].forEach(item => {
        const div = document.createElement('div');
        div.className = "sub-item";
        div.style.background = colors[key];

        div.innerHTML = `<div style="font-size:3rem; margin-bottom:15px;">📄</div>${item}`;
        div.addEventListener("click", () => openDetails(item));

        subGrid.appendChild(div);
    });
}

const fieldTemplates = {
    "Birth Certificate": `<div class="input-group"><label>Full Name</label><input type="text" name="fullname"></div><div class="input-group"><label>Birth Date</label><input type="date" name="dob"></div><div class="input-group"><label>Upload Scan</label><input type="file" class="file-input" accept="image/*"></div>`,

    "Passport": `<div class="input-group"><label>Passport Number</label><input type="text" name="pass_num"></div><div class="input-group"><label>Expiry Date</label><input type="date" name="expiry"></div><div class="input-group"><label>Upload Photo</label><input type="file" class="file-input" accept="image/*"></div>`,

    "National ID Card": `<div class="input-group"><label>ID Number</label><input type="text" name="id_num"></div><div class="input-group"><label>Expiry Date</label><input type="date" name="expiry"></div><div class="input-group"><label>Upload Card Image</label><input type="file" class="file-input" accept="image/*"></div>`,

    "default": `<div class="input-group"><label>Notes</label><textarea name="notes"></textarea></div><div class="input-group"><label>Upload Scan</label><input type="file" class="file-input" accept="image/*"></div>`
};

function openDetails(itemName) {
    const modal = document.getElementById('info-modal');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const preview = document.getElementById('image-preview');

    let savedData = {};
    try {
        const raw = localStorage.getItem(itemName);
        if (raw) savedData = JSON.parse(raw);
    } catch {}

    document.getElementById('modal-title').innerText = itemName;
    dynamicInputs.innerHTML = fieldTemplates[itemName] || fieldTemplates["default"];

    const lastModifiedElem = document.getElementById('last-modified');
    lastModifiedElem.innerText = savedData.lastModified 
        ? `Last updated: ${savedData.lastModified}` 
        : "";

    
    const oldBtn = dynamicInputs.querySelector('.btn-delete');
    if (oldBtn) oldBtn.remove();

    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete Document";
    deleteBtn.className = "btn-delete";

    deleteBtn.onclick = () => {
        if(confirm("Are you sure?")) {
            localStorage.removeItem(itemName);
            showToast("Document deleted ❌");
            closeModal();
            goBack();
        }
    };

    dynamicInputs.appendChild(deleteBtn);

    const inputs = dynamicInputs.querySelectorAll('input[type="text"], input[type="date"], textarea');

    inputs.forEach(input => {
        if (savedData[input.name]) input.value = savedData[input.name];
    });

    if (savedData.image) {
        preview.src = savedData.image;
        preview.classList.remove('hidden');
    } else {
        preview.src = "";
        preview.classList.add('hidden');
    }

    modal.showModal();
}

function closeModal() {
    document.getElementById('info-modal').close();
}

function goBack() {
    location.reload(); 
}

document.getElementById('info-form').onsubmit = function(e) {
    e.preventDefault();

    const itemName = document.getElementById('modal-title').innerText;
    const formData = new FormData(e.target);
    const dataObject = Object.fromEntries(formData.entries());

    const fileInput = document.querySelector('.file-input');

    const hasText = Object.values(dataObject).some(val => val && val.trim() !== "");
    const hasFile = fileInput && fileInput.files && fileInput.files[0];

    if (!hasText && !hasFile) {
        showToast("Please enter info or upload file ⚠️");
        return;
    }

    if (hasFile) {
        const reader = new FileReader();

        reader.onload = () => {
            dataObject.image = reader.result;
            dataObject.lastModified = new Date().toLocaleString();

            localStorage.setItem(itemName, JSON.stringify(dataObject));
            showToast("Data Secured 🔒");
            closeModal();
        };

        reader.readAsDataURL(fileInput.files[0]);
    } else {
        let oldData = {};
        try {
            const raw = localStorage.getItem(itemName);
            if (raw) oldData = JSON.parse(raw);
        } catch {}

        dataObject.image = oldData.image;
        dataObject.lastModified = new Date().toLocaleString();

        localStorage.setItem(itemName, JSON.stringify(dataObject));
        showToast("Updated ✅");
        closeModal();
    }
};