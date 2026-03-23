import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewTeacher, DeactivateTeacherModal } from "../components/Modals"
import { getTeachers, filterTeachers, deactivateTeacher } from "../client/client"

const Teachers = () => {
    const {contextHolder, messageApi} = useContext(appContext)
    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)
    const [searchText, setSearchText] = useState('')
    const [addModal, setAddModal] = useState(false)
    const [deactivateModal, setDeactivateModal] = useState({open: false, teacherId: null})

    async function getInfo(){
        const res = await getTeachers(page)
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({
                type: "error",
                content: "Ha ocurrido un error"
            })
        }
    }

    async function searchTeachers(){
        const q = (searchText || '').trim()
        if(q === ''){
            getInfo()
            return
        }
        const res = await filterTeachers(q)
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
            <Divider className='PageTitle'><h1>Profesores</h1></Divider>
            {contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar profesor"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)} />
                <Button onClick={searchTeachers}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map((item) => (
                        <List.Item className='listItem' key={item.id}>
                            <div className="info">
                                <h4>{item.identification} - {item.name} {item.lastname}</h4>
                            </div>
                            {item.status === 'Activo' && <Button color="danger" onClick={() => setDeactivateModal({open: true, teacherId: item.id})}>Desactivar</Button>}
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewTeacher 
                open={addModal}
                onCancel={() => setAddModal(false)}
                updateList={() => getInfo()}
            />
            <DeactivateTeacherModal
                open={deactivateModal.open}
                teacherId={deactivateModal.teacherId}
                onCancel={() => setDeactivateModal({open: false, teacherId: null})}
                updateList={() => getInfo()}
            />
        </div>
    )
}

export default Teachers
