// Dashboard module for managing projects

// Utility to get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Utility to save current user
function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Load dashboard
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = user.username;
    renderProjects(user.projects);
});

// Render projects
function renderProjects(projects) {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = '';

    projects.forEach((project, index) => {
        const user = getCurrentUser();
        let filesHtml = '';
        if (project.files && project.files.length > 0) {
            filesHtml = '<div class="project-files" style="margin-top: 0.5rem;">';
            project.files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    filesHtml += `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100px; border-radius: 4px; margin: 0.25rem;">`;
                } else {
                    filesHtml += `<a href="${file.dataUrl}" download="${file.name}" style="display: block; margin: 0.25rem 0;">${file.name}</a>`;
                }
            });
            filesHtml += '</div>';
        }
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card scroll-fade-in';
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p><strong>Technologies:</strong> ${project.technologies}</p>
            ${filesHtml}
            <button onclick="editProject(${index})">Edit</button>
            <button onclick="deleteProject(${index})">Delete</button>
            <button onclick="viewPortfolio('${user.username}')">View Portfolio</button>
        `;
        projectsList.appendChild(projectCard);
    });

    // Add scroll animation observer
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
}

// Add project
document.getElementById('add-project-btn')?.addEventListener('click', () => {
    openModal();
});

// Edit project
function editProject(index) {
    const user = getCurrentUser();
    const project = user.projects[index];
    document.getElementById('project-id').value = index;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-tech').value = project.technologies;
    document.getElementById('modal-title').textContent = 'Edit Project';
    openModal();
}

// Delete project
function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        const user = getCurrentUser();
        user.projects.splice(index, 1);
        saveCurrentUser(user);
        renderProjects(user.projects);
    }
}

// View portfolio
function viewPortfolio(username) {
    window.location.href = `portfolio.html?user=${encodeURIComponent(username)}`;
}

// Modal functions
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

// Project form submit
document.getElementById('project-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const technologies = document.getElementById('project-tech').value.trim();
    const filesInput = document.getElementById('project-files');
    const files = filesInput.files;

    const user = getCurrentUser();
    const project = { title, description, technologies, files: [] };

    // Process uploaded files with FileReader for data URLs
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

    Promise.all(filePromises).then(fileData => {
        project.files = fileData;

        if (id === '') {
            user.projects.push(project);
        } else {
            user.projects[id] = project;
        }

        saveCurrentUser(user);
        renderProjects(user.projects);
        closeModal();
    });
});

// Display uploaded files in modal
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

// Search projects
document.getElementById('search-input')?.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const user = getCurrentUser();
    const filtered = user.projects.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.technologies.toLowerCase().includes(query)
    );
    renderProjects(filtered);
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});
