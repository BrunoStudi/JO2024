import { Link } from "react-router-dom";

const Dashboard = () => {
    return ( 
        <div>
            <h2>Bienvenue sur le Dashboard !</h2>
            <Link to="/logout">Se déconnecter</Link>
        </div>
    );
};

export default Dashboard;