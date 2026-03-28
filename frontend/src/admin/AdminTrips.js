import { useEffect,useState } from "react";
import axios from "axios";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AdminTrips(){

 const [trips,setTrips] = useState([]);

 useEffect(()=>{

   API.get("/api/admin/trips...")
   .then(res=>{
     setTrips(res.data);
   });

 },[]);

 const deleteTrip = async(id)=>{

   await API.delete("/api/admin/trips...");

   setTrips(trips.filter(t=>t._id!==id));

 };

 return(

  <AdminLayout>

   <h2>Trips</h2>

   <table border="1">

    <thead>

     <tr>
      <th>Title</th>
      <th>Location</th>
      <th>Price</th>
      <th>Actions</th>
     </tr>

    </thead>

    <tbody>

     {trips.map(trip=>(

      <tr key={trip._id}>

       <td>{trip.title}</td>
       <td>{trip.location}</td>
       <td>{trip.price}</td>

       <td>
        <button onClick={()=>deleteTrip(trip._id)}>Delete</button>
       </td>

      </tr>

     ))}

    </tbody>

   </table>

  </AdminLayout>

 );
}

export default AdminTrips;