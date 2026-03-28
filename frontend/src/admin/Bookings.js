import {useEffect,useState} from "react";
import axios from "axios";
import API from "../api/axiosInstance";

function Bookings(){

 const [bookings,setBookings] = useState([]);

 const fetchBookings = async()=>{

  const res = await API.get("/api/bookings");

  setBookings(res.data);

 };

 useEffect(()=>{
  fetchBookings();
 },[]);


 return(

  <div>

   <h2>Bookings</h2>

   <table border="1">

    <thead>

     <tr>
      <th>User</th>
      <th>Email</th>
      <th>Trip</th>
      <th>Location</th>
      <th>Travel Date</th>
      <th>Status</th>
      <th>Payment</th>
     </tr>

    </thead>

    <tbody>

     {bookings.map(b=>(
      <tr key={b._id}>

       <td>{b.user_id?.name}</td>
       <td>{b.user_id?.email}</td>

       <td>{b.trip_id?.title}</td>
       <td>{b.trip_id?.location}</td>

       <td>{new Date(b.travel_date).toDateString()}</td>

       <td>{b.booking_status}</td>

       <td>{b.payment_status}</td>

      </tr>
     ))}

    </tbody>

   </table>

  </div>

 );

}

export default Bookings;