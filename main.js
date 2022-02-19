import Prometeus from "./Prometeus.js";

const prometeus = new Prometeus();

prometeus.loadTexture("./tilemap.png", () => {
    prometeus.clearScreen();
    prometeus.addImage(0, 0, 48, 48, 0, 0, 16, 16);
    prometeus.draw();
})