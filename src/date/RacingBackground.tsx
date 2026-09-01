import React from "react";
import { CarSilhouette, SteeringWheel } from "./RacingArt";

/**
 * Декоративний фоновий шар: клітчасті смуги фінішу зверху й знизу,
 * велике напівпрозоре кермо та машинка на задньому плані. Суто
 * декоративно — під контентом (рендериться першим у DateInvite,
 * власного z-index не має, тож стоїть під усім іншим).
 */
const RacingBackground: React.FC = () => (
  <div className="racing-bg" aria-hidden="true">
    <div className="checkered-strip checkered-top" />
    <div className="checkered-strip checkered-bottom" />
    <SteeringWheel className="bg-wheel" />
    <CarSilhouette className="bg-car" />
  </div>
);

export default RacingBackground;
