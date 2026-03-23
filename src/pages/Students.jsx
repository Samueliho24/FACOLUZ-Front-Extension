import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewStudent, DeactivateStudentModal } from "../components/Modals"
import { getStudents, filterStudents, deactivateStudent } from "../client/client"

const Students = () => {

    const {contextHolder, messageApi} = useContext(appContext)
    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)
    const [searchText, setSearchText] = useState('')

    const [addModal, setAddModal] = useState(false)
    const [deactivateModal, setDeactivateModal] = useState({open: false, studentId: null})

    async function getInfo(){
        const res = await getStudents(page)
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({
                type: "error",
                content: "ah ocurrido un error"
            })
        }
    }

    async function searchStudents(){
        const q = (searchText || '').trim()
        if(q === ''){
            getInfo()
            return
        }
        const res = await filterStudents(q)
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({ type: 'error', content: 'Error al buscar' })
        }
    }

    useEffect(() => {
        getInfo()
    }, [page])

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Estudiantes</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar estudiante"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)} />
                <Button onClick={searchStudents}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map((item) => (
                        <List.Item className='listItem' key={item.id}>
                            <div className="info">
                                <h4>{item.studentsIdentification} - {item.name} {item.lastname}</h4>
                            </div>
                            {item.status === 'Activo' && <Button color="danger" onClick={() => setDeactivateModal({open: true, studentId: item.id})}>Desactivar</Button>}
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewStudent 
                open={addModal}
                onCancel={() => setAddModal(false)}
                updateList={() => getInfo()}
            />
            <DeactivateStudentModal
                open={deactivateModal.open}
                studentId={deactivateModal.studentId}
                onCancel={() => setDeactivateModal({open: false, studentId: null})}
                updateList={() => getInfo()}
            />
        </div>
    )
}

export default Students