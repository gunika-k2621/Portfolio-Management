// Dashboard module for managing projects

const API_URL = 'http://localhost:3000/api';
let userProjects = [];

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = user.username;
    
    try {
        if (user.id === 0) {
            // Guest mode
            renderProjects([]);
        } else {
            const res = await fetch(`${API_URL}/projects/${user.id}`);
            if (res.ok) {
                userProjects = await res.json();
                renderProjects(userProjects);
            }
        }
    } catch (err) {
        console.error('Server error', err);
    }
});

function renderProjects(projects) {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = '';

    projects.forEach((project) => {
        const user = getCurrentUser();
        let filesHtml = '';
        if (project.files && project.files.length > 0) {
            filesHtml = '<div class="project-files" style="margin-top: 0.5rem;">';
            project.files.forEach(file => {
                if (file.type && file.type.startsWith('image/')) {
                    filesHtml += `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100px; border-radius: 4px; margin: 0.25rem;">`;
                } else {
                    filesHtml += `<a href="${file.dataUrl}" download="${file.name}" style="display: block; margin: 0.25rem 0;">${file.name}</a>`;
                }
            });
            filesHtml += '</div>';
        }
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card scroll-fade-in visible';
        
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p><strong>Technologies:</strong> ${project.technologies}</p>
            ${filesHtml}
            <button onclick="editProject(${project.id})">Edit</button>
            <button onclick="deleteProject(${project.id})">Delete</button>
            <button onclick="viewPortfolio('${user.username}')">View Portfolio</button>
        `;
        projectsList.appendChild(projectCard);
    });
}

document.getElementById('add-project-btn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (user.id === 0) {
        alert("Guests cannot add projects. Please register to save data.");
        return;
    }
    openModal();
});

function editProject(projectId) {
    const project = userProjects.find(p => p.id === projectId);
    if (!project) return;
    
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-tech').value = project.technologies;
    document.getElementById('modal-title').textContent = 'Edit Project';
    openModal();
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
            if (res.ok) {
                userProjects = userProjects.filter(p => p.id !== projectId);
                renderProjects(userProjects);
            } else {
                alert('Failed to delete project');
            }
        } catch (err) {
            alert('Server error');
        }
    }
}

function viewPortfolio(username) {
    window.location.href = `portfolio.html?user=${encodeURIComponent(username)}`;
}

function openModal() {
    document.getElementById('project-modal').style.display = 'flex';
}

document.querySelector('.close')?.addEventListener('click', () => {
    closeModal();
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('project-modal')) {
        closeModal();
    }
});

function closeModal() {
    document.getElementById('project-modal').style.display = 'none';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('modal-title').textContent = 'Add Project';
}

document.getElementById('project-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const technologies = document.getElementById('project-tech').value.trim();
    const filesInput = document.getElementById('project-files');
    const files = filesInput.files;

    const user = getCurrentUser();
    const projectData = { user_id: user.id, title, description, technologies };
    if (id) projectData.id = parseInt(id, 10);

    const filePromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                dataUrl: reader.result
            });
            reader.readAsDataURL(file);
        });
    });

    try {
        const fileData = await Promise.all(filePromises);
        projectData.files = fileData;
        
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        
        if (res.ok) {
            const projectsRes = await fetch(`${API_URL}/projects/${user.id}`);
            userProjects = await projectsRes.json();
            renderProjects(userProjects);
            closeModal();
        } else {
            alert('Failed to save project');
        }
    } catch (err) {
        alert('Server error or files too large (Base64 approach).');
    }
});

document.getElementById('project-files')?.addEventListener('change', function() {
    const filesList = document.getElementById('uploaded-files-list');
    filesList.innerHTML = '';
    const files = this.files;
    if (files.length === 0) {
        filesList.textContent = 'No files selected.';
        return;
    }
    const ul = document.createElement('ul');
    for (let i = 0; i < files.length; i++) {
        const li = document.createElement('li');
        li.textContent = `${files[i].name} (${(files[i].size / 1024).toFixed(2)} KB)`;
        ul.appendChild(li);
    }
    filesList.appendChild(ul);
});

document.getElementById('search-input')?.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = userProjects.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technologies.toLowerCase().includes(query)
    );
    renderProjects(filtered);
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});
