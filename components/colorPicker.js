import { SketchPicker } from 'react-color';
import React, { useState, useEffect } from 'react';

export const ColorPicker = props => {
    const [color, setColor] = useState({
        r: '241',
        g: '112',
        b: '19',
        a: '1',
    });

    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker);
    }

    const handleClose= () => {
        setDisplayColorPicker(false);
    }

    const handleChange = (color) => {
        setColor(color.rgb);
        props.onChange(color);
    }
    return (
        <div>
            <div className='swatch' onClick={ handleClick }>
                    <div className='color' />
            </div>
            {
                displayColorPicker 
                ?
                    <div className='popover'>
                        <div className='cover' onClick={ handleClose }/>
                        <SketchPicker color={ color } onChange={ handleChange } />
                    </div>
                :
                    null
            }
            <style jsx>
                {
                    `
                    .grid {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-wrap: wrap;
              
                        max-width: 800px;
                        margin-top: 3rem;
                    }
                    .swatch {            
                        padding: 5px;
                        background: #fff;
                        border-radius: 1px;
                        box-shadow: 0px 1px #888888;
                        cursor: pointer;
                    }
                    .popover {
                        position: absolute;
                        z-index: 2;
                    }
                    .cover {
                        position: fixed;
                        top: 10px;
                        right: 0px;
                        bottom: 0px;
                        left: 0px;
                    }
                    .color {
                        height: 14px;
                        border-radius: 2px;
                        background-color: rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a });
                    }
                    `
                }
            </style>
        </div>
    );
}