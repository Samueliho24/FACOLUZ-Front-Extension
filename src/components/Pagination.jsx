import { Button, Divider } from 'antd'
import React from 'react'

const Pagination = ({page, setPage}) => {

    const nextPage = () => {
        setPage(page+1)
    }

    const prevPage = () => {
        if(page >= 2){
            setPage(page-1)
        }
    }

    return(
        <>
            <div className='CustomDivider'/>
            <div className="Pagination">
                <Button disabled={page <= 1} onClick={prevPage}>Anterior</Button>
                <h3>{page}</h3>
                <Button onClick={nextPage}>Siguiente</Button>
            </div>
        </>
    )
}

export default Pagination