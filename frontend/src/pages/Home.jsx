import Carousel from "../Composants/Carousel";

const Home = () => {
    return (
        <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-6 text-indigo-700">Bienvenue aux Jeux Olympiques 2024</h1>
            <Carousel />
            <p className="mt-6 text-lg">
                Réservez vos billets pour les JO 2024 en toute sécurité via notre plateforme numérique.
            </p>
        </div>
    );
};

export default Home;