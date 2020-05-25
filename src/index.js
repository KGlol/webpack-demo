import hello from './hello';
import world from './world';
import jpg1 from './images/1.jpg';
import jpg2 from './images/2.jpg';
import png1 from './images/screem_shot.png';
import './style/index.sass';


console.log(`${hello} ${world}`);

console.log(jpg1, jpg2, png1);

const oImg = document.createElement('img');

oImg.src = jpg2;

document.body.appendChild(oImg);
