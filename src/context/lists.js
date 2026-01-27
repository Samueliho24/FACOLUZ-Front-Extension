export function searchOnList(list, id){
    return list.find(item => item.value == id).label
}

export function searchFullOnList(list, id){
    return list.find(item => item.value == id)
}

export const instructionGradeList = [
    {label: 'Ninguno', value: 0},
    {label: 'Prescolar', value: 1},
    {label: 'Primaria', value: 3},
    {label: 'Bachillerato', value: 4},
    {label: 'Universitario', value: 5},
    {label: 'Postgrado', value: 6},
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
    {label: 'Cirugia', value: 1, price: 5},
    {label: 'Endodoncia', value: 2, price: 5},
    {label: 'Ortodoncia', value: 3, price: 5},
    {label: 'Peridoncia', value: 4, price: 5},
    {label: 'Protesis total', value: 5, price: 5},
    {label: 'Protesis parcial removible', value: 6, price: 5},
    {label: 'Protesis parcial fija', value: 7, price: 5},
    {label: 'CIA (Consulta)', value: 8, price: 5},
    {label: 'CIAN (Consulta)', value: 9, price: 5},
    {label: 'CIA (Historia)', value: 10, price: 10},
    {label: 'CIAN (Historia)', value: 11, price: 10},
    {label: 'Emergencia de CIA', value: 12, price: 5},
    {label: 'Emergencia de CIAN', value: 13, price: 5}
]

export const paymentMethods = [
    {label: 'Bolivares en efectivo', value: 1},
    {label: 'Bolivares en transferencia', value: 2},
    {label: 'Dolares en efectivo', value: 3},
    {label: 'Exoneración', value: 4},
]