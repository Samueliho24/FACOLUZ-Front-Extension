export function searchOnList(list, id){
    return list.find(item => item.value == id).label
}

export function searchFullOnList(list, id){
    return list.find(item => item.value == id)
}

export const instructionGradeList = [
    {label: 'Ninguno', value: 1},
    {label: 'Bachillerato', value: 2},
    {label: 'Universitario', value: 3},
    {label: 'Postgrado', value: 4},
]

export const moduleList = [
    {label: 'Nociones basicas de la Anatomia Dental y Oclusion', value: 1},
    {label: 'Realaciones Humanas', value: 2},
    {label: 'Sistema de Atencion Odontologica', value: 3},
    {label: 'Semiologia e Historia Clinica', value: 4},
    {label: 'Bioetica y Odontologia Legal', value: 5},
    {label: 'Bioseguridad y Esterilizacion en Odontologia', value: 6},
    {label: 'Practica Profesional I', value: 7},
    {label: 'Asistencia de Procedimientos Clincos Odontologicos', value: 8},
    {label: 'Biomateriales Odontologicos', value: 9},
    {label: 'Nociones Basicas en Radiologia e Imagenologia Odontologica', value: 10},
    {label: 'Epidemiologia y Sistema de informacion', value: 11},
    {label: 'Ingles Intrumental', value: 12},
    {label: 'Educacion y Promocion de la Salud Bucal', value: 13},
    {label: 'Fotografia Clinica y Marketing en Odontologia', value: 14},
    {label: 'Practica Profesional II', value: 15},
    {label: 'Servicios Comunitario', value: 16},
]

export const bloodTypeList = [
    {label: 'A+', value: 0},
    {label: 'O+', value: 1},
    {label: 'B+', value: 2},
    {label: 'AB+', value: 3},
    {label: 'A-', value: 4},
    {label: 'O-', value: 5},
    {label: 'B-', value: 6},
    {label: 'AB-', value: 7},
]

export const patientTypeList = [
    {label: 'Niño', value: 0},
    {label: 'Adulto', value: 1}
]

export const sexList = [
    {label: 'Masculino', value: 0},
    {label: 'Femenino', value: 1}
]

export const identificationList = [
    {label: 'V', value: 1},
    {label: 'E', value: 2},
    {label: 'Cod.', value: 0},
]

export const trueFalseList = [
    {label: 'Si', value: true},
    {label: 'No', value: false},
]

export const raceList = [
    {label: 'Blanco', value: 0},
    {label: 'Negro', value: 1},
    {label: 'Moreno', value: 2},
    {label: 'Indigena', value: 3},
]

export const alimentsList = [
    {label: 'Adenopatias', value: 0},
    {label: 'Afeccion cardiovascular', value: 1},
    {label: 'Afecciones hematologicas', value: 2},
    {label: 'Afeccion renal', value: 3},
    {label: 'Afeccion neurologica', value: 4},
    {label: 'Afeccion hepatica', value: 5},
    {label: 'Diabetes', value: 6},
    {label: 'Trastornos gastrointestinales', value: 7},
    {label: 'Fiebre reumatica', value: 8},
    {label: 'Asma', value: 9},
    {label: 'Cefaleas frecuentes', value: 10},
    {label: 'Herpes', value: 11},
    {label: 'VIH', value: 12},
    {label: 'VPH', value: 13},
    {label: 'ETS', value: 14},
    {label: 'Perdida de peso', value: 15},
    {label: 'Convulsiones', value: 16},
    {label: 'Sindrome Genetico', value: 17},
    {label: 'Retraso mental', value: 18},
    {label: 'Trastornos auditivos o de habla', value: 19},
    {label: 'Trastorno respiratorio', value: 20},
    {label: 'Alergias a medicamentos', value: 21},
    {label: 'Enfermedades infectocontagiosas', value: 22},
    {label: 'Afecciones O.R.L.', value: 23},
    {label: 'Dificultades de aprendizaje', value: 24},
]

export const userTypeList = [
    {label: 'Administrador de sistemas', value: 0},
    {label: 'Docente', value: 1},
    {label: 'Estudiante', value: 2},
    {label: 'Administrador de estudios', value: 3},
    {label: 'Recepcionista', value: 4},
]

export const changeLogsActionType = [
    {label: 'creo un usuario a', value: 0},
    {label: 'desactivo el usuario de', value: 1},
    {label: 'reactivo el usuario de', value: 2},
    {label: 'cambio la contrasena de', value: 3},
    {label: 'cambio el tipo de usuario de', value: 4}
]

export const BillableItems = [
    {label: 'Inscripcion', value: 1, price: 5},
    {label: 'Materia', value: 2, price: 5},
    {label: 'Actividad especial', value: 3, price: 5},
    {label: 'Reimpresion de certificado', value: 4, price: 5},
]

export const paymentMethods = [
    {label: 'Bolivares en efectivo', value: 1},
    {label: 'Bolivares en transferencia', value: 2},
    {label: 'Dolares en efectivo', value: 3},
    {label: 'Exoneración', value: 4},
]