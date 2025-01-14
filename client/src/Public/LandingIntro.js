import TemplatePointers from "./TemplatePointers";
import logo from './../assets/img/KNMlogowhite.jpg';

function LandingIntro() {
    return (
        <div className="hero min-h-full rounded-l-xl bg-base-200">
            <div className="hero-content py-12">
                <div className="max-w-md">
                    <h1 className="text-3xl text-center font-bold">
                       
                        Kababaihan ng Maynila
                    </h1>
                    <div className="text-center ">
                        <img src={logo} alt="Dashwind Admin Template" className="w-48 inline-block" />
                    </div>
                    {/* Importing pointers component */}
                    {/*    */}
                </div>
            </div>
        </div>
    );
}

export default LandingIntro;