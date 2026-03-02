// Portfolio viewing module

// Utility to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Utility to get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Load portfolio and resume
document.addEventListener('DOMContentLoaded', () => {
    const username = getQueryParam('user');
    if (!username) {
        window.location.href = 'error.html';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        window.location.href = 'error.html';
        return;
    }

    document.getElementById('portfolio-owner').textContent = `${user.username}'s Portfolio`;
    renderPortfolio(user.projects);
    displayResume(user.resume);

    // Add scroll animation observer
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.classList.add('scroll-fade-in');
        observer.observe(card);
    });
});

// Render portfolio projects
function renderPortfolio(projects) {
    const container = document.getElementById('portfolio-projects');
    container.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'portfolio-card scroll-fade-in';
        let filesHtml = '';
        if (project.files && project.files.length > 0) {
            filesHtml = '<div class="project-files">';
            project.files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    filesHtml += `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100%; border-radius: 8px; margin-top: 0.5rem;">`;
                } else {
                    filesHtml += `<a href="${file.dataUrl}" download="${file.name}" target="_blank">${file.name}</a><br>`;
                }
            });
            filesHtml += '</div>';
        }
        card.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p><strong>Technologies:</strong> ${project.technologies}</p>
            ${filesHtml}
        `;
        container.appendChild(card);
    });
}

// Filter projects by technology
document.getElementById('filter-btn')?.addEventListener('click', () => {
    const filterTech = document.getElementById('filter-tech').value.toLowerCase();
    const username = getQueryParam('user');
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return;

    const filtered = user.projects.filter(p =>
        p.technologies.toLowerCase().includes(filterTech)
    );
    renderPortfolio(filtered);
});

// Back to dashboard button
document.getElementById('back-dashboard')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Display resume section
function displayResume(resume) {
    const resumeDisplay = document.getElementById('resume-display');
    resumeDisplay.innerHTML = '';

    if (!resume) {
        resumeDisplay.textContent = 'No resume uploaded.';
        return;
    }

    const link = document.createElement('a');
    link.href = resume.dataUrl;
    link.textContent = `Download ${resume.name}`;
    link.download = resume.name;
    link.target = '_blank';
    link.style.display = 'block';
    link.style.marginBottom = '1rem';

    resumeDisplay.appendChild(link);

    if (resume.type === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = resume.dataUrl;
        iframe.style.width = '100%';
        iframe.style.height = '400px';
        iframe.style.border = 'none';
        resumeDisplay.appendChild(iframe);
    }
}

// Resume upload
document.getElementById('resume-upload')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const resume = {
            name: file.name,
            type: file.type,
            dataUrl: reader.result
        };

        const username = getQueryParam('user');
        const users = getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            user.resume = resume;
            localStorage.setItem('users', JSON.stringify(users));
            displayResume(resume);
        }
    };
    reader.readAsDataURL(file);
});
