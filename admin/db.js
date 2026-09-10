// Professional-grade client-side database with data protection
// Uses LocalStorage with safety mechanisms to prevent data loss

const STORAGE_KEY = 'fitconsultAdminData_v2'; // Versioned to avoid conflicts
const BACKUP_KEY = 'fitconsultAdminData_backup';
const DEMO_DATA_KEY = 'fitconsultDemoDataShown'; // Tracks if demo was shown

const db = {
    // Initialize database - ONLY creates demo if NO data exists at all
    init: function() {
        // Check if we have ANY user data (not just demo)
        const stored = localStorage.getItem(STORAGE_KEY);
        const backup = localStorage.getItem(BACKUP_KEY);

        // If we have user data or backup, use it
        if (stored || backup) {
            this.loadFromStorage();
            return;
        }

        // NO USER DATA EXISTS - check if we should show demo
        const demoShown = localStorage.getItem(DEMO_DATA_KEY);
        if (!demoShown) {
            // First time ever - show demo data but mark it as such
            this.loadDemoData();
            localStorage.setItem(DEMO_DATA_KEY, 'true');

            // Show notification that this is demo data
            setTimeout(() => {
                alert('⚠️ Dados de demonstração carregados. ' +
                      'Adicione seus próprios dados para substituí-los.\n' +
                      'Seus dados serão salvos automaticamente no navegador.');
            }, 1500);
        } else {
            // Demo was shown before but user cleared data - start empty
            this.createEmptyDatabase();
        }
    },

    // Load demo data (marking it as such)
    loadDemoData: function() {
        const demoData = {
            administrators: [
                { id: 1, name: "Administrador", email: "admin@fitconsult.com",
                  avatar: "https://via.placeholder.com/150", role: "admin" }
            ],
            students: [], // Start with empty students - demo shows how to add
            workouts: [],
            assessments: [],
            appointments: [],
            payments: [],
            notifications: [
                {
                    id: 1,
                    message: "Bem-vindo! Este é um sistema de demonstração. " +
                             "Adicione seu primeiro aluno em 'Alunos' para começar.",
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    type: "welcome"
                }
            ]
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
        this.currentData = demoData;
    },

    // Create completely empty database
    createEmptyDatabase: function() {
        const emptyData = {
            administrators: [
                { id: 1, name: "Administrador", email: "admin@fitconsult.com",
                  avatar: "https://via.placeholder.com/150", role: "admin" }
            ],
            students: [],
            workouts: [],
            assessments: [],
            appointments: [],
            payments: [],
            notifications: []
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
        this.currentData = emptyData;
    },

    // Load data from storage
    loadFromStorage: function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            this.currentData = stored ? JSON.parse(stored) : this.createEmptyDatabase();

            // Validate data structure
            this.validateDataStructure();
        } catch (e) {
            console.error('Erro ao carregar dados, tentando backup...', e);
            // Try to recover from backup
            const backup = localStorage.getItem(BACKUP_KEY);
            if (backup) {
                try {
                    this.currentData = JSON.parse(backup);
                    // Show recovery notification
                    setTimeout(() => {
                        alert('⚠️ Dados principais corrompidos. ' +
                              'Recuperado do backup automático. ' +
                              'Verifique seus dados e considere exportar um novo backup.');
                    }, 1500);
                } catch (e2) {
                    console.error('Backup também corrompido:', e2);
                    this.createEmptyDatabase();
                }
            } else {
                this.createEmptyDatabase();
            }
        }
    },

    // Save data to storage with backup
    saveToStorage: function() {
        if (!this.currentData) return;

        try {
            // Create backup before saving
            localStorage.setItem(BACKUP_KEY, JSON.stringify(this.currentData));

            // Save main data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentData));

            // Update last saved timestamp
            this.currentData._metadata = {
                lastSaved: new Date().toISOString(),
                version: '2.0'
            };

            return true;
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            return false;
        }
    },

    // Validate and fix data structure
    validateDataStructure: function() {
        if (!this.currentData) {
            this.createEmptyDatabase();
            return;
        }

        // Ensure all required collections exist
        const requiredCollections = [
            'administrators', 'students', 'workouts',
            'assessments', 'appointments', 'payments', 'notifications'
        ];

        requiredCollections.forEach(collection => {
            if (!Array.isArray(this.currentData[collection])) {
                this.currentData[collection] = [];
            }
        });

        // Ensure admin exists
        if (!this.currentData.administrators.length) {
            this.currentData.administrators.push({
                id: 1,
                name: "Administrador",
                email: "admin@fitconsult.com",
                avatar: "https://via.placeholder.com/150",
                role: "admin"
            });
        }

        // Re-save if we fixed anything
        this.saveToStorage();
    },

    // ========== STUDENT OPERATIONS ==========
    getStudents: function() {
        return Array.isArray(this.currentData?.students)
            ? this.currentData.students
            : [];
    },

    getStudentById: function(id) {
        return this.getStudents().find(student => student.id === id) || null;
    },

    saveStudent: function(studentData) {
        // Validate required fields
        if (!studentData.name || !studentData.name.trim()) {
            throw new Error('Nome do aluno é obrigatório');
        }

        const students = this.getStudents();
        const existingIndex = students.findIndex(s => s.id === studentData.id);

        if (existingIndex >= 0) {
            // Update existing
            students[existingIndex] = {
                ...students[existingIndex],
                ...studentData,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Create new
            const newId = this.getNextId('students');
            const newStudent = {
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...studentData
            };
            students.push(newStudent);
            studentData.id = newId; // Return the new ID
        }

        this.saveToStorage();
        return studentData;
    },

    deleteStudent: function(id) {
        const students = this.getStudents();
        const initialLength = students.length;
        this.currentData.students = students.filter(s => s.id !== id);

        if (this.currentData.students.length < initialLength) {
            this.saveToStorage();
            return true;
        }
        return false;
    },

    // ========== WORKOUT OPERATIONS ==========
    getWorkouts: function() {
        return Array.isArray(this.currentData?.workouts)
            ? this.currentData.workouts
            : [];
    },

    saveWorkout: function(workoutData) {
        if (!workoutData.name || !workoutData.name.trim()) {
            throw new Error('Nome do treino é obrigatório');
        }

        const workouts = this.getWorkouts();
        const existingIndex = workouts.findIndex(w => w.id === workoutData.id);

        if (existingIndex >= 0) {
            workouts[existingIndex] = {
                ...workouts[existingIndex],
                ...workoutData,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newId = this.getNextId('workouts');
            const newWorkout = {
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...workoutData
            };
            workouts.push(newWorkout);
            workoutData.id = newId;
        }

        this.saveToStorage();
        return workoutData;
    },

    // ========== ASSESSMENT OPERATIONS ==========
    getAssessments: function() {
        return Array.isArray(this.currentData?.assessments)
            ? this.currentData.assessments
            : [];
    },

    saveAssessment: function(assessmentData) {
        // Validate student exists
        if (!assessmentData.studentId ||
            !this.getStudentById(assessmentData.studentId)) {
            throw new Error('Aluno não encontrado para esta avaliação');
        }

        const assessments = this.getAssessments();
        const existingIndex = assessments.findIndex(a => a.id === assessmentData.id);

        if (existingIndex >= 0) {
            assessments[existingIndex] = {
                ...assessments[existingIndex],
                ...assessmentData,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newId = this.getNextId('assessments');
            const newAssessment = {
                id: newId,
                createdAt: new Date().toISOString(),
                ...assessmentData
            };
            assessments.push(newAssessment);
            assessmentData.id = newId;

            // Update student's last assessment date
            const student = this.getStudentById(assessmentData.studentId);
            if (student) {
                student.lastAssessment = assessmentData.date;
                this.saveStudent(student); // This will save to storage
            }
        }

        this.saveToStorage();
        return assessmentData;
    },

    // ========== APPOINTMENT OPERATIONS ==========
    getAppointments: function() {
        return Array.isArray(this.currentData?.appointments)
            ? this.currentData.appointments
            : [];
    },

    saveAppointment: function(appointmentData) {
        // Validate student exists
        if (!appointmentData.studentId ||
            !this.getStudentById(appointmentData.studentId)) {
            throw new Error('Aluno não encontrado para este agendamento');
        }

        const appointments = this.getAppointments();
        const existingIndex = appointments.findIndex(a => a.id === appointmentData.id);

        if (existingIndex >= 0) {
            appointments[existingIndex] = {
                ...appointments[existingIndex],
                ...appointmentData,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newId = this.getNextId('appointments');
            const newAppointment = {
                id: newId,
                createdAt: new Date().toISOString(),
                ...appointmentData
            };
            appointments.push(newAppointment);
            appointmentData.id = newId;

            // Update student's next appointment
            const student = this.getStudentById(appointmentData.studentId);
            if (student) {
                student.nextAppointment = appointmentData.date;
                this.saveStudent(student);
            }
        }

        this.saveToStorage();
        return appointmentData;
    },

    // ========== PAYMENT OPERATIONS ==========
    getPayments: function() {
        return Array.isArray(this.currentData?.payments)
            ? this.currentData.payments
            : [];
    },

    savePayment: function(paymentData) {
        // Validate student exists
        if (!paymentData.studentId ||
            !this.getStudentById(paymentData.studentId)) {
            throw new Error('Aluno não encontrado para este pagamento');
        }

        // Validate amount
        if (!paymentData.amount || paymentData.amount <= 0) {
            throw new Error('Valor do pagamento deve ser maior que zero');
        }

        const payments = this.getPayments();
        const existingIndex = payments.findIndex(p => p.id === paymentData.id);

        if (existingIndex >= 0) {
            payments[existingIndex] = {
                ...payments[existingIndex],
                ...paymentData,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newId = this.getNextId('payments');
            const newPayment = {
                id: newId,
                createdAt: new Date().toISOString(),
                ...paymentData
            };
            payments.push(newPayment);
            paymentData.id = newId;

            // Update student's financial status
            this.updateStudentFinancialStatus(paymentData.studentId);
        }

        this.saveToStorage();
        return paymentData;
    },

    // ========== NOTIFICATION OPERATIONS ==========
    getNotifications: function() {
        return Array.isArray(this.currentData?.notifications)
            ? this.currentData.notifications
            : [];
    },

    saveNotification: function(notificationData) {
        const notifications = this.getNotifications();
        const newId = this.getNextId('notifications');
        const newNotification = {
            id: newId,
            createdAt: new Date().toISOString(),
            ...notificationData
        };
        notifications.push(newNotification);
        this.saveToStorage();
        return newNotification;
    },

    markNotificationAsRead: function(id) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.isRead = true;
            this.saveToStorage();
            return true;
        }
        return false;
    },

    // ========== HELPER METHODS ==========
    getNextId: function(collectionName) {
        const collection = this.getCollection(collectionName);
        if (!collection.length) return 1;
        return Math.max(...collection.map(item => item.id)) + 1;
    },

    getCollection: function(name) {
        return this.currentData?.[name] || [];
    },

    updateStudentFinancialStatus: function(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return;

        const payments = this.getPayments()
            .filter(p => p.studentId === studentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

        if (!payments.length) {
            student.financialStatus = 'Sem pagamentos';
        } else {
            const latestPayment = payments[0];
            const today = new Date();
            const dueDate = new Date(latestPayment.dueDate);

            if (latestPayment.status === 'Pago' ||
                (latestPayment.status === 'Pendente' && dueDate >= today)) {
                student.financialStatus = 'Em dia';
            } else {
                student.financialStatus = 'Atrasado';
            }
        }

        this.saveStudent(student);
    },

    // ========== DASHBOARD STATS ==========
    getActiveStudentsCount: function() {
        return this.getStudents().filter(s => s.status === 'Ativo').length;
    },

    getNewStudentsThisMonth: function() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.getStudents().filter(s =>
            new Date(s.createdAt || s.startDate) >= startOfMonth
        ).length;
    },

    getTodayAppointmentsCount: function() {
        const today = new Date().toISOString().split('T')[0];
        return this.getAppointments().filter(a => a.date === today).length;
    },

    getPendingPaymentsAmount: function() {
        return this.getPayments()
            .filter(p => p.status === 'Pendente' || p.status === 'Atrasado')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getOverdueAssessmentsCount: function() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.getStudents().filter(student => {
            const lastAssessment = new Date(student.lastAssessment || student.createdAt);
            return lastAssessment < thirtyDaysAgo && student.status === 'Ativo';
        }).length;
    },

    // ========== DATA IMPORT/EXPORT ==========
    exportData: function() {
        if (!this.currentData) return null;

        // Remove internal metadata for clean export
        const exportData = { ...this.currentData };
        delete exportData._metadata;

        return JSON.stringify(exportData, null, 2);
    },

    importData: function(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);

            // Validate basic structure
            const requiredCollections = [
                'administrators', 'students', 'workouts',
                'assessments', 'appointments', 'payments', 'notifications'
            ];

            for (const collection of requiredCollections) {
                if (!Array.isArray(parsed[collection])) {
                    parsed[collection] = [];
                }
            }

            // Ensure admin exists
            if (!parsed.administrators.length) {
                parsed.administrators.push({
                    id: 1,
                    name: "Administrador",
                    email: "admin@fitconsult.com",
                    avatar: "https://via.placeholder.com/150",
                    role: "admin"
                });
            }

            // Store as new data (will overwrite current)
            this.currentData = parsed;
            this.saveToStorage();

            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    },

    clearAllData: function() {
        if (confirm('⚠️ ATENÇÃO: Esto irá EXCLUIR TODOS os seus dados permanentemente. ' +
                   'Esta ação não pode ser desfeita. ' +
                   'Você deseja continuar?')) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(BACKUP_KEY);
            localStorage.removeItem(DEMO_DATA_KEY);
            this.createEmptyDatabase();
            return true;
        }
        return false;
    },

    getLastSaved: function() {
        return this.currentData?._metadata?.lastSaved || 'Nunca salvo';
    }
};

// Initialize database on load
db.init();

// Make db globally accessible
window.db = db;

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
}