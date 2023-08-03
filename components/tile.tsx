import React from "react";
import styles from '../styles/tile.module.css';

interface TileProps {
    image?: string;
    x: number;
    y: number;
    type: number;
    isPiece: boolean;
}

const Tile: React.FunctionComponent<TileProps> = (props) => {
    const { image, type, isPiece, x, y } = props;
    const imageSrc = image || "/pieces/transparent_image.png";

    let tileClass = styles.tile;
    let pieceClass = "";

    if (type % 2 === 0) {
        tileClass += ` ${styles["black-tile"]}`;
        pieceClass = styles.piece;
    } else {
        tileClass += ` ${styles["white-tile"]}`;
        if(isPiece) pieceClass = styles.piece;
    }

    // Calculate the position of the piece based on the x and y props
    const positionStyle = {
        top:  `${y * 100}px`,
        left: `${x * 100}px`,
    };

    return (
        <div className={tileClass}>
            {isPiece && (
                <div
                    style={{ ...positionStyle, backgroundImage: `url(${imageSrc})` }}
                    className={pieceClass}
                />
            )}
            {/* [{props.desc}] */}
        </div>
    );
};

export default Tile;
