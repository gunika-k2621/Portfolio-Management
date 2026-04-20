// Portfolio viewing module

const API_URL = 'http://localhost:3000/api';
let portfolioUser = null;

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', async () => {
    const username = getQueryParam('user');
    if (!username) {
        window.location.href = 'error.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/portfolio/${username}`);
        if (!res.ok) {
            window.location.href = 'error.html';
            return;
        }
        
        portfolioUser = await res.json();
        
        document.getElementById('portfolio-owner').textContent = `${portfolioUser.username}'s Portfolio`;
        renderPortfolio(portfolioUser.projects);
        displayResume(portfolioUser.resume);

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
    } catch (err) {
        console.error('Server error', err);
        window.location.href = 'error.html';
    }
});

function renderPortfolio(projects) {
    const container = document.getElementById('portfolio-projects');
    container.innerHTML = '';
    
    if (!projects) return;

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'portfolio-card scroll-fade-in visible';
        let filesHtml = '';
        if (project.files && project.files.length > 0) {
            filesHtml = '<div class="project-files">';
            project.files.forEach(file => {
                if (file.type && file.type.startsWith('image/')) {
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

document.getElementById('filter-btn')?.addEventListener('click', () => {
    const filterTech = document.getElementById('filter-tech').value.toLowerCase();
    if (!portfolioUser || !portfolioUser.projects) return;

    const filtered = portfolioUser.projects.filter(p =>
        p.technologies.toLowerCase().includes(filterTech)
    );
    renderPortfolio(filtered);
});

document.getElementById('back-dashboard')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

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

document.getElementById('resume-upload')?.addEventListener('change', function() {
    if (!portfolioUser) {
        alert("Wait for user data to load");
        return;
    }
    
    // verify the viewing user is the currently logged-in user
    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) {
        alert("Log in to upload resume"); return;
    }
    const currentUser = JSON.parse(currentUserRaw);
    if (currentUser.username !== portfolioUser.username) {
        alert("Not authorized to post resume to this portfolio."); return;
    }

    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        const resume = {
            user_id: currentUser.id, // Must be ID
            name: file.name,
            type: file.type,
            dataUrl: reader.result
        };

        try {
            const res = await fetch(`${API_URL}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resume)
            });
            
            if (res.ok) {
                portfolioUser.resume = resume;
                displayResume(resume);
                alert("Resume uploaded!");
            } else {
                alert("Upload failed.");
            }
        } catch(err) {
             alert('Error connecting to server.');
        }
    };
    reader.readAsDataURL(file);
});
