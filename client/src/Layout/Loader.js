import React from 'react';
import { reuleaux } from 'ldrs'

reuleaux.register()

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen">
         <l-reuleaux
            size="37"
            stroke="5"
            stroke-length="0.15"
            bg-opacity="0.1"
            speed="1.2" 
            color="#df1f47" 
            ></l-reuleaux>
        </div>
    );
};

export default Loading;


