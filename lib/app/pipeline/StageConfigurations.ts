import Stage from "./Stage";

export enum StageType {
    BETA = "BETA",
    PROD = "PROD",
}

export class StageConfigurations {
    // Configure Sages
    static BETA: Stage = new Stage(StageType.BETA);
    static PROD: Stage = new Stage(StageType.PROD);
    
    // Define Stages to be added to the Pipeline
    static ACTIVE_STAGES = [
        StageConfigurations.BETA,
        StageConfigurations.PROD
    ]
}