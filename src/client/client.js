import axios from 'axios'
import { httpMethods } from './httpMethods'

const http = new httpMethods()
let token

//Iniciar sesion
export async function login(data){
	const res = await http.post('session/login', null, data)
	if(res.status == 200){
		token = res.data.jwt
	}
	return res
}

//Obtener elementos facturables
export async function getBillables(){
	return await http.get("lists/billables", token, null)
}

//Actualizar precios de elementos facturables
export async function savePrices(data){
	return await http.put('lists/prices', token, data)
}

//Emitir factura
export async function issueInvoice(data){
	return await http.post('invoice', token, data)
}

// Obtener facturas para una cedula
export async function searchInvoicesByStudentId(studentId, page){
	return await http.get(`invoice/${studentId}/${page}`, token, null)
}

//Obtener todas las facturas
export async function getAllInvoices(page){
	return await http.get(`invoice/${page}`, token, null)
}

//Obtener precio del dolar a banco central
export async function getDolarPrice(){
	let res = await axios.get("https://ve.dolarapi.com/v1/dolares/oficial")
	return res.data.promedio
}

//Crear nuevo estudiante
export async function registerStudents(data){
	return await http.post('student/', token, data)
}

// Obtener lista de estudiantes por numero de cedula
export async function filterStudents(param){
    return await http.get(`student/${param}`, token, null)
}

//Obtener estudiantes en una seccion
export async function getStudentsInSection(sectionId) {
	return await http.get(`section/${sectionId}/students`, token, null)
}

//Obtener informacion sobre la ultima inscripcion de un estudiante
export async function getLastEnrollmentByStudentId(studentId){
	return await http.get(`student/${studentId}/lastEnrollment`, token, null)
}

//Obtener lista de estudiantes
export async function getStudents(page){
	return await http.get(`student/list/${page}`, token, null)
}

// Desactivar un estudiante
export async function deactivateStudent(studentId){
    return await http.post(`student/${studentId}/deactivate`, token, null)
}

// Subir o actualizar foto de un estudiante
export async function updatePhoto(formData, studentId){
	return await http.post(`student/${studentId}/photo`, token, formData)
}

// Imprimir carnet de un estudiante
export async function printStudentCard(studentId) {
	return await http.get(`student/${studentId}/card`, token, null)
}

// Crear nuevo periodo
export async function openPeriod(data){
	return await http.post('period/open', token, data)
}

//Obtener lista de periodos
export async function getPeriods(){
	return await http.get(`periods`, token, null)
}

//Obtener periodo actual
export async function getCurrentPeriod(){
	return await http.get('period/current', token, null)
}

//Actualizar periodo
export async function updatePeriod(data){
	return await http.patch('period', token, data)
}

//Cerrar periodo
export async function closePeriod(data){
	return await http.post('period/close', token, data)
}

//Obtener periodos activos
export async function getActivePeriods(){
	return await http.get('period/active', token, null)
}

// Crear seccion nueva
export async function openSection(data){
	return await http.post('section/open', token, data)
}

//Cerrar una seccion
export async function closeSection(data){
	return await http.post('section/close', token, data)
}

// Obtener secciones de un periodo
export async function getSectionByPeriod(periodId){
	return await http.get(`section/period/${periodId}`, token, null)
}

//Crear curso nuevo
export async function createNewCourse(data){
	return await http.post('course', token, data)
}

// Crear modulo nuevo
export async function createNewModule(data){
	return await http.post('module', token, data)
}

// Obtener todos los cursos
export async function getAllCourses(data){
	return await http.get('course', token, data)
}

// Obtener todos los modulos
export async function getAllModules(){
	return await http.get('module', token, null)
}

//Buscar modulo por descripcion
export async function getSearchedModule(description){
	return await http.get(`module/${description}`, token, null)
}

// Obtener estudiantes para un modulo determinado
export async function getEnrolledStudentsByModule(moduleId){
	return await http.get(`module/${moduleId}/students`, token, null)
}

// Obtener modulos para un curso
export async function getAssignedModules(courseId){
	return await http.get(`course/${courseId}/modules`, token, null)
}

// Asignar o actualizar modulos asignados a un curso
export async function updateAssignedModules(courseId, data){
    return await http.put(`course/${courseId}/modules`, token, data)
}

// Desactivar un modulo
export async function deactivateModule(moduleId){
	return await http.post(`module/${moduleId}/deactivate`, token, null)
}

// Realizar inscripcion
export async function registerEnrollment(data){
	return await http.post('enrollment', token, data)
}

//Obtener lista de profesores
export async function getTeachers(page){
    return await http.get(`teacher/${page}`, token, null)
}

//Obtener lista de profesores por nombre, apellido o cedula
export async function filterTeachers(param){
    return await http.get(`teacher/${param}`, token, null)
}

//Crear nuevo profesor
export async function createTeacher(data){
    return await http.post('teacher', token, data)
}

// Descartivar un profesor
export async function deactivateTeacher(teacherId){
    return await http.post(`teacher/${teacherId}/deactivate`, token, null)
}

// Crear ususario nuevo
export async function createUser(data) {
	return await http.post(`user`, token, data)
}

// Actualizar usuario
export async function updateUser (data){
	return await http.patch(`user`, token, data)
}

// Obtener lista de usuarios
export async function getAllUsers(page) {
	return await http.get(`user/list/${page}`, token, null)
}

// Ubicar usuario por numero EXACTO de cedula (no filtrar, ubicar)
export async function getUserById(id){
	return await http.get("api/user", token, id)
}

// Desactivar un usuario
export async function deleteUser(userId){
	return await http.delete(`user/${userId}}`, token, id)
}

// Reactivar un usuario
export async function reactivateUser(userId){
	return await http.post(`user/${userId}}/reactivate`, token, null)
}

// Cambiar contraseña de un usuario
export async function changePassword(data) {
	return await http.patch('user/updatePassword', token, data)
}

// Actualizar tipo de usuario
export async function changeUserType(data) {
	return await http.patch('user/userType', token, data)
}

// Obtener todos los logs
export async function getAllChangeLogs(page) {
	return await http.get(`logs/${page}`, token, null)
}

//Obtener lista de certificados
export async function getCertificateList(){
	return await http.get("certificate", token, null)
}

// Obtener certificados de un estudiante
export async function getCertificatesByStudent(studentId){
	return await http.get(`certificate/student/${studentId}}`, token, null)
}

// Realizar pago nuevo
export async function makePayment(data){
	return await http.post("payment", token, data)
}

// Anular factura
export async function cancelInvoice(invoiceId){
	return await http.delete(`invoice/${invoiceId}`, token, null)
}

// Obtener pagos para una factura
export async function getPaymentsForInvoice(invoiceId){
	return await http.get(`invoice/${invoiceId}/payments`, token, null)
}

//Imprimir certificado
export async function saveCertificate(certificateId){
	return await http.download(`certificate/${certificateId}`, token, null)
}

// Obtener reporte diario
export async function getDailyReport(){
	return await http.download(`report/daily`, token, null)
}

// Subir documentos de un estudiante
export async function uploadStudentDocument(formData, studentId) {
	return await http.post(`document/${studentId}`, token, formData)
}

// Obtener lista de documentos de un estudiante
export async function getStudentDocuments(studentId){
	return await http.get(`document/${studentId}`, token, null)
}

// Obtener un documento con su id
export async function getDocument(docId){
	return await http.download(`document/${docId}`, token, null)
}

// Subir notas al sistema
export async function setLoadScores(data) {
	return await http.post('', token, data)
}

// Obtener notas de un estudiante para una materia determinada
export	async function getScoreByStudent(moduleId, studentIdentification) {
	return await http.get(`score/module/${moduleId}/${studentIdentification}`, token, null)
}

// Actualizar notas de un estudiante
// export async function setUpdateScore(data) {
// 	return await http.post('api/setUpdateScore', token, data)
// }

// Obtener modulos de un curso
export async function getModulesByCourse(courseId) {
    return await http.get(`course/${courseId}/modules`, token, null);
}

// Obtener modulos aprovados por un estudante
export async function getApprovedModulesByStudent(studentId, courseId) {
    return await http.get(`course/${courseId}/${studentId}/approvedModules`, token, null);
}

// Obtener historial de inscripciones para un estudiante
export async function getEnrollmentHistory(studentId) {
	console.log(studentId)
    return await http.get(`student/${studentId}/history`, token, null);
}


export async function createStudentCohort(data) {
    return await http.post('api/createCohort', token, data);
}

export async function getSectionByModule(moduleId, sectionCode, periodId) {
    const params = new URLSearchParams();
	console.log(moduleId, sectionCode, periodId)
    if (sectionCode) params.append('sectionCode', sectionCode);
    if (periodId) params.append('periodId', periodId);
	const queryString = params.toString();
    return await http.get(`api/getSectionByModule/${moduleId}${queryString ? `?${queryString}` : ''}`, token, null);
}

export async function getEnrollmentCountBySection(sectionId) {
    return await http.get(`api/getEnrollmentCount/${sectionId}`, token, null);
}


// Pendientes

// export async function getGradeStudentsBySection(periodId, sectionCode){
// 	return await http.get(`api/getGradeStudentsBySection/${periodId}/${sectionCode}`, token, null)
// }