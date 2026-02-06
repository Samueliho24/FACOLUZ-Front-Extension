import axios from 'axios'
import { httpMethods } from './httpMethods'

const http = new httpMethods()
let token

export async function login(data){
	const res = await http.post('api/login', null, data)
	if(res.status == 200){
		token = res.data.jwt
	}
	return res
}

export async function getIdInvoice(){
	console.log(token)
	return await http.get('api/getIdInvoice', token, null)
	
}

export async function issueInvoice(data){
	return await http.post('api/issueInvoice', token, data)
}

export async function getInvoicesVerification(page){
	return await http.get(`api/getinvoicesVerification/${page}`, token, null)
}

export async function getinvoicesVerificationById(patientId, page){
	return await http.get(`api/getinvoicesVerificationById/${patientId}/${page}`, token, null)
}

export async function verifyInvoice(data){
	return await http.post('api/verifyInvoice', token, data)
}

export async function getInvoicesById(patientId, page){
	return await http.get(`api/getInvoices/${patientId}/${page}`, token, null)
}

export async function getAllInvoices(page){
	return await http.get(`api/getInvoices/${page}`, token, null)
}

export async function getSearchedPatient(identification){
	return await http.get(`api/getSearchedPatient/${identification}`, token, null)
}

export async function getDolarPrice(){
	let res = await axios.get("https://ve.dolarapi.com/v1/dolares/oficial")
	return res.data.promedio
}

export async function getSettings(){
	return await http.get('api/getSettings', token, null)
}

//Endpoints del proceso de inscripcion

export async function registerStudents(data){
	return await http.post('api/registerStudents', token, data)
}

export async function getStudentById(id){
	return await http.get(`api/getStudentById/${id}`, token, null)
}

export async function getStudents(page){
	return await http.get(`api/getStudents/${page}`, token, null)
}

export async function openPeriod(data){
	return await http.post('api/openPeriod', token, data)
}

export async function getCurrentPeriod(){
	return await http.get('api/getCurrentPeriod', token, null)
}

export async function changeEndDatePeriod(data){
	return await http.patch('api/changeEndDatePeriod', token, data)
}

export async function closePeriod(data){
	return await http.post('api/closePeriod', token, data)
}

export async function createNewCourse(data){
	return await http.post('api/course', token, data)
}

export async function createNewModule(data){
	return await http.post('api/module', token, data)
}

export async function getAllCourses(data){
	return await http.get('api/course', token, data)
}

export async function getAllModules(){
	return await http.get('api/getAllModules', token, null)
}

export async function getSearchedModule(description){
	return await http.get(`api/getSearchedModule/${description}`, token, null)
}

export async function getEnrolledStudentsByModule(moduleId){
	return await http.get(`api/getEnrolledStudentsByModule/${moduleId}`, token, null)
}

export async function assignModuleToCourse(data){
	return await http.post('api/assignModuleToCourse', token, data)
}

export async function getAssignedModules(data){
	return await http.post('api/getAssignedModules', token, data)
}

export async function registerEnrollment(data){
	return await http.post('api/registerEnrollment', token, data)
}

export async function updateEnrollmentState(data){
	return await http.patch('api/updateEnrollmentState', token, data)
}




// export async function getSearchedUsers(text, page){
// 	return await http.get(`api/getSearchedUsers/${text}/${page}`, token, null)
// }
	
export async function getAllUsers(page) {
	return await http.get(`api/getAllUsers/${page}`, token, null)
}
export async function getSearchedSDeactivatedUsers(text, page){
	return await http.get(`api/getSearchedSDeactivatedUsers/${text}/${page}`, token, null)
}

export async function getDeactivatedUsers(page) {
	return await http.get(`api/getDeactivatedUsers/${page}`, token, null)
}

export async function getIdUsers(id) {
	return await http.get('api/getIdUsers', token, id)
}

export async function createUser(data) {
	return await http.post('api/createUser', token, data)
}

export async function deleteUser(id){
	return await http.delete('api/deleteUser', token, id)
}

export async function reactivateUser(id){
	return await http.patch('api/reactivateUser', token, id)
}

export async function changePassword(data) {
	return await http.patch('api/changePassword', token, data)
}

export async function changeUserType(data) {
	return await http.patch('api/changeUserType', token, data)
}

export async function getAllChangeLogs(page) {
	return await http.get(`api/getAllChangeLogs/${page}`, token, null)
}