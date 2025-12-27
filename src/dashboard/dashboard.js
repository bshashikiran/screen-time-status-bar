(function() {
    const vscode = acquireVsCodeApi();
    
    // Refresh button handler
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Send refresh message to extension
            vscode.postMessage({
                command: 'refresh'
            });
        });
    }
    
    window.toggleDateSection = function(sectionId) {
        const content = document.getElementById(sectionId);
        if (!content) return;
        
        const header = content.previousElementSibling;
        const toggleIcon = header ? header.querySelector('.toggle-icon') : null;
        
        if (content.style.display === 'none' || !content.style.display) {
            content.style.display = 'block';
            if (toggleIcon) toggleIcon.textContent = 'expand_less';
            if (header) header.classList.add('expanded');
        } else {
            content.style.display = 'none';
            if (toggleIcon) toggleIcon.textContent = 'expand_more';
            if (header) header.classList.remove('expanded');
        }
    };
    
    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'update':
                // Could be used for real-time updates in the future
                break;
        }
    });
    
    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();

