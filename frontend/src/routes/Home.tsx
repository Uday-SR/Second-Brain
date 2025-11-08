import '../App.css'
import { Button } from '../components/Buttons'
import { Card } from '../components/Card'
import { ShareIcon } from '../icons/ShareIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { Sidebar } from '../components/Sidebar'
import { useState } from 'react'



function App() {
  const [ sidebar, setSidebar ] = useState(true);
  const toggleSidebar = () => setSidebar(!sidebar);

  return ( <div>
    <div className=''>
      <Sidebar expanded={sidebar} toggleSidebar={toggleSidebar}/>
      <div className={`flex-1 min-h-screen bg-blue-200 text-white transition-all duration-300 
          ${sidebar ? "ml-60" : "ml-20"} p-5`}>
        
        <div>
          <div className='flex px-2 py-4 space-x-4 justify-end'>
            <Button variant="primary" size="sm" text="Add Content" startIcon={<PlusIcon/>} onClick={() => {}}></Button>
            <Button variant="secondary" size="sm" text="Share" startIcon={<ShareIcon/>} onClick={() => {}}></Button>
          </div> 
          <br/>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 relative'>
            <Card  title="First Tweet" type="twitter" link="https://twitter.com/dj_usr/status/1965862374726045708"/>

            <Card title="Dave Plummer" type='youtube' link='https://youtu.be/KVYup3Qwh8Q?si=1H0MEULoNE27GRwn'/>  

            <Card  title="First Tweet" type="twitter" link="https://twitter.com/dj_usr/status/1965862374726045708"/>

            <Card title="Dave Plummer" type='youtube' link='https://youtu.be/KVYup3Qwh8Q?si=1H0MEULoNE27GRwn'/>  

            <Card  title="First Tweet" type="twitter" link="https://twitter.com/dj_usr/status/1965862374726045708"/>

            <Card title="Dave Plummer" type='youtube' link='https://youtu.be/KVYup3Qwh8Q?si=1H0MEULoNE27GRwn'/>  

            <Card  title="First Tweet" type="twitter" link="https://twitter.com/dj_usr/status/1965862374726045708"/>

            <Card title="Dave Plummer" type='youtube' link='https://youtu.be/KVYup3Qwh8Q?si=1H0MEULoNE27GRwn'/>  

            <Card  title="First Tweet" type="twitter" link="https://twitter.com/dj_usr/status/1965862374726045708"/>

            <Card title="Dave Plummer" type='youtube' link='https://youtu.be/KVYup3Qwh8Q?si=1H0MEULoNE27GRwn'/>  
          </div>
        </div>  
      </div>
      </div>
    </div>  
  )
}

export default App
