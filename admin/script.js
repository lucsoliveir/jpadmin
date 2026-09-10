document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            sidebar.style.width = '80px';
            mainContent.style.marginLeft = '80px';
            // Hide text labels
            document.querySelectorAll('.sidebar-logo h2, .sidebar-logo p, .sidebar-nav .nav-link span, .sidebar-footer .admin-info').forEach(el => {
                el.style.display = 'none';
            });
        } else {
            sidebar.style.width = '280px';
            mainContent.style.marginLeft = '280px';
            // Show text labels
            document.querySelectorAll('.sidebar-logo h2, .sidebar-logo p, .sidebar-nav .nav-link span, .sidebar-footer .admin-info').forEach(el => {
                el.style.display = 'block';
            });
        }
    });

    sidebarToggleMobile.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        if (sidebar.classList.contains('mobile-open')) {
            sidebar.style.width = '280px';
            sidebar.style.visibility = 'visible';
        } else {
            sidebar.style.width = '0';
            sidebar.style.visibility = 'hidden';
        }
    });

    // Mobile sidebar close when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !sidebarToggleMobile.contains(e.target) && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            sidebar.style.width = '0';
            sidebar.style.visibility = 'hidden';
        }
    });

    // Generate alerts dynamically
    const alertsContainer = document.getElementById('alertsContainer');
    const alerts = [
        {
            icon: 'fas fa-exclamation-triangle',
            color: '--warning-color',
            title: 'João está há 30 dias sem avaliação.',
            time: 'Há 2 horas'
        },
        {
            icon: 'fas fa-hand-holding-usd',
            color: '--danger-color',
            title: 'Carlos possui pagamento atrasado.',
            time: 'Há 5 horas'
        },
        {
            icon: 'fas fa-calendar-alt',
            color: '--primary-color',
            title: 'Pedro possui atendimento amanhã às 14:00.',
            time: 'Há 1 dia'
        },
        {
            icon: 'fas fa-dumbbell',
            color: '--success-color',
            title: 'Maria precisa de atualização de treino.',
            time: 'Há 3 horas'
        }
    ];

    alerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <i class="${alert.icon} alert-icon" style="color: var(${alert.color})"></i>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.time}</p>
            </div>
        `;
        alertsContainer.appendChild(alertItem);
    });

    // Generate schedule items dynamically
    const scheduleContainer = document.getElementById('scheduleContainer');
    const scheduleItems = [
        {
            time: '09:00',
            timeLabel: 'Manhã',
            name: 'João Silva',
            service: 'Avaliação de performance'
        },
        {
            time: '10:30',
            timeLabel: 'Manhã',
            name: 'Carlos Oliveira',
            service: 'Consultoria'
        },
        {
            time: '14:00',
            timeLabel: 'Tarde',
            name: 'Pedro Santos',
            service: 'Revisão de treino'
        },
        {
            time: '16:00',
            timeLabel: 'Tarde',
            name: 'Ana Costa',
            service: 'Avaliação inicial'
        }
    ];

    scheduleItems.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="schedule-time">
                <h4>${item.time}</h4>
                <p>${item.timeLabel}</p>
            </div>
            <div class="schedule-details">
                <h4>${item.name}</h4>
                <p>${item.service}</p>
            </div>
        `;
        scheduleContainer.appendChild(scheduleItem);
    });

    // Stats counters with animation
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) ||
                      parseInt(counter.textContent.replace(/[^\d]/g, '')) || 0;
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('pt-BR');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('pt-BR');
            }
        };

        // Check if it's a currency value
        if (counter.closest('.stat-card').querySelector('.stat-icon i.fa-hand-holding-usd')) {
            counter.textContent = 'R$ 0,00';
            const updateCurrency = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = `R$ ${Math.floor(current).toLocaleString('pt-BR')},00`;
                    requestAnimationFrame(updateCurrency);
                } else {
                    counter.textContent = `R$ ${target.toLocaleString('pt-BR')},00`;
                }
            };
            updateCurrency();
        } else {
            updateCounter();
        }
    });

    // Simple chart simulation (in a real app, you'd use Chart.js or similar)
    const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
    chartPlaceholders.forEach((placeholder, index) => {
        // Create a simple bar chart simulation
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '100%';
        chartContainer.style.position = 'relative';

        // Generate random data for demo
        const data = [4, 6, 3, 8, 5, 7, 4].map(() => Math.floor(Math.random() * 6) + 2);
        const maxValue = Math.max(...data);

        data.forEach((value, i) => {
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.bottom = '0';
            bar.style.width = 'calc(100% / 7 - 2px)';
            bar.style.height = `${(value / maxValue) * 80}%`;
            bar.style.background = 'linear-gradient(to top, var(--primary-color), var(--secondary-color))';
            bar.style.left = `${i * (100 / 7)}%`;
            bar.style.borderRadius = '4px 4px 0 0';
            bar.style.transition = 'height 0.5s ease';

            // Add value label on hover
            bar.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.style.position = 'absolute';
                tooltip.style.bottom = '100%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '4px 8px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '0.8rem';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.style.zIndex = '10';
                tooltip.innerHTML = value;
                bar.appendChild(tooltip);
            });

            bar.addEventListener('mouseleave', () => {
                const tooltip = bar.querySelector('div');
                if (tooltip) tooltip.remove();
            });

            chartContainer.appendChild(bar);
        });

        placeholder.innerHTML = '';
        placeholder.appendChild(chartContainer);
    });

    // Notification badge pulse
    const notificationBadge = document.querySelector('.notification-badge');
    setInterval(() => {
        notificationBadge.style.animation = 'pulse 1.5s infinite';
    }, 5000);

    // Add pulse keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.6; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Auto-refresh alerts every 30 seconds (simulating real-time updates)
    setInterval(() => {
        // In a real app, this would fetch new alerts from the server
        // For demo, we'll just shuffle the existing alerts
        const alertItems = Array.from(alertsContainer.children);
        for (let i = alertItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [alertItems[i], alertItems[j]] = [alertItems[j], alertItems[i]];
        }
        alertItems.forEach(item => alertsContainer.appendChild(item));
    }, 30000);
});