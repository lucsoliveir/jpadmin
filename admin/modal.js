/**
 * Modal / form engine usado no lugar do prompt() do navegador.
 * Uso:
 *   const result = await openModal({
 *     title: 'Novo aluno',
 *     submitLabel: 'Cadastrar',
 *     fields: [
 *       { name: 'name', label: 'Nome', type: 'text', required: true },
 *       { name: 'plan', label: 'Plano', type: 'select', options: [...] }
 *     ]
 *   });
 *   if (result) { ... result.name, result.plan ... }
 *
 * result é null se o usuário cancelou/fechou o modal.
 */
(function () {
    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function buildFieldHTML(field) {
        const id = `modal-field-${field.name}`;
        const req = field.required ? 'required' : '';
        let inputHtml = '';

        switch (field.type) {
            case 'textarea':
                inputHtml = `<textarea id="${id}" name="${field.name}" ${req} placeholder="${escapeHtml(field.placeholder || '')}" rows="${field.rows || 3}">${escapeHtml(field.value || '')}</textarea>`;
                break;
            case 'select': {
                const opts = (field.options || []).map(o =>
                    `<option value="${escapeHtml(o.value)}" ${String(o.value) === String(field.value ?? '') ? 'selected' : ''}>${escapeHtml(o.label)}</option>`
                ).join('');
                const placeholderOpt = field.placeholder
                    ? `<option value="" disabled ${field.value ? '' : 'selected'}>${escapeHtml(field.placeholder)}</option>`
                    : '';
                inputHtml = `<select id="${id}" name="${field.name}" ${req}>${placeholderOpt}${opts}</select>`;
                break;
            }
            case 'number':
                inputHtml = `<input type="number" id="${id}" name="${field.name}" ${req} placeholder="${escapeHtml(field.placeholder || '')}" value="${field.value ?? ''}" ${field.step != null ? `step="${field.step}"` : 'step="any"'} ${field.min != null ? `min="${field.min}"` : ''}>`;
                break;
            case 'date':
                inputHtml = `<input type="date" id="${id}" name="${field.name}" ${req} value="${field.value || ''}">`;
                break;
            case 'time':
                inputHtml = `<input type="time" id="${id}" name="${field.name}" ${req} value="${field.value || ''}">`;
                break;
            case 'checkbox':
                return `
                <div class="modal-field modal-field-checkbox">
                    <label class="modal-checkbox-label">
                        <input type="checkbox" id="${id}" name="${field.name}" ${field.value ? 'checked' : ''}>
                        <span>${escapeHtml(field.label)}</span>
                    </label>
                </div>`;
            default:
                inputHtml = `<input type="text" id="${id}" name="${field.name}" ${req} placeholder="${escapeHtml(field.placeholder || '')}" value="${escapeHtml(field.value || '')}">`;
        }

        return `
        <div class="modal-field">
            <label for="${id}">${escapeHtml(field.label)}${field.required ? ' <span class="modal-required">*</span>' : ''}</label>
            ${inputHtml}
        </div>`;
    }

    window.openModal = function (config) {
        return new Promise((resolve) => {
            const fields = config.fields || [];
            let fieldsHtml = '';
            let lastSection = null;

            fields.forEach(field => {
                if (field.section && field.section !== lastSection) {
                    fieldsHtml += `<h4 class="modal-section-title">${escapeHtml(field.section)}</h4>`;
                    lastSection = field.section;
                } else if (!field.section) {
                    lastSection = null;
                }
                fieldsHtml += buildFieldHTML(field);
            });

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div class="modal-header">
                        <div>
                            <h3 id="modal-title">${escapeHtml(config.title || '')}</h3>
                            ${config.subtitle ? `<p class="modal-subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
                        </div>
                        <button type="button" class="modal-close" aria-label="Fechar">&times;</button>
                    </div>
                    <form class="modal-form" novalidate>
                        <div class="modal-body">${fieldsHtml}</div>
                        <div class="modal-footer">
                            <button type="button" class="modal-btn modal-btn-secondary" data-action="cancel">${escapeHtml(config.cancelLabel || 'Cancelar')}</button>
                            <button type="submit" class="modal-btn modal-btn-primary">${escapeHtml(config.submitLabel || 'Salvar')}</button>
                        </div>
                    </form>
                </div>`;

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            const form = overlay.querySelector('.modal-form');
            const firstInput = overlay.querySelector('input, select, textarea');
            if (firstInput) setTimeout(() => firstInput.focus(), 50);

            let settled = false;
            function close(result) {
                if (settled) return;
                settled = true;
                document.body.style.overflow = '';
                document.removeEventListener('keydown', escHandler);
                overlay.classList.add('modal-closing');
                setTimeout(() => overlay.remove(), 150);
                resolve(result);
            }

            function escHandler(e) {
                if (e.key === 'Escape') close(null);
            }

            overlay.querySelector('.modal-close').addEventListener('click', () => close(null));
            overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(null));
            overlay.addEventListener('mousedown', (e) => {
                if (e.target === overlay) close(null);
            });
            document.addEventListener('keydown', escHandler);

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
                    return;
                }
                const data = {};
                fields.forEach(field => {
                    const el = form.elements[field.name];
                    if (!el) return;
                    if (field.type === 'checkbox') {
                        data[field.name] = el.checked;
                    } else if (field.type === 'number' || field.numeric) {
                        data[field.name] = el.value === '' ? null : parseFloat(el.value);
                    } else {
                        data[field.name] = el.value;
                    }
                });
                close(data);
            });
        });
    };

    // Atalho para um modal com um único campo de seleção (substitui os antigos
    // prompt() de "selecione o aluno pelo ID").
    window.openSelectModal = function ({ title, subtitle, label, options, submitLabel }) {
        return window.openModal({
            title,
            subtitle,
            submitLabel: submitLabel || 'Continuar',
            fields: [{ name: 'value', label: label || 'Selecione', type: 'select', options, required: true, numeric: true }]
        }).then(result => (result ? result.value : null));
    };
})();
