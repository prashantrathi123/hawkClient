import React from 'react';

const Logo = ({ altText = "Logo", width = 100, height = 100 }) => {
    return (
        <img 
            src="./HawkLogoCircular.png"
            alt={altText} 
            width={width} 
            height={height} 
            style={{ display: 'block', margin: '0 auto' }}
        />
    );
};

export default Logo;
