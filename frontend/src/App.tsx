import './App.css'
import { Button } from './components/Buttons'
import { Card } from './components/Card'
import { ShareIcon } from './icons/ShareIcon'
import { PlusIcon } from './icons/PlusIcon'
import { Sidebar } from './components/Sidebar'


function App() {

  return ( <div>
    <Sidebar/>
    <div className="min-h-screen bg-blue-200 text-white ml-76 pl-5">
      
      {/* buttons */}
      <div className='flex px-2 py-4 space-x-4 justify-end'>
        <Button variant="primary" size="md" text="Add Content" startIcon={<PlusIcon/>} onClick={() => {}}></Button>
        <Button variant="secondary" size="md" text="Share" startIcon={<ShareIcon/>} onClick={() => {}}></Button>
      </div> 
      <br/>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
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
  )
}

export default App
