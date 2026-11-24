import { InstitutionalAuditController } from "../ibite/institutional-audit.controller.js";
import { MyIbiteAssignmentsController } from "../ibite/my-assignments.controller.js";
import { AssignmentsController } from "../ibite/assignments.controller.js";
import { ResultsController } from "../ibite/results.controller.js";
import { IbiteCaptureController } from "../ibite/capture.controller.js";
import { IbiteCampaignControlController } from "../ibite/campaign-control.controller.js";
import { IbiteStudentStartController } from "../ibite/student-start.controller.js";
import { IbitePublicCaptureController } from "../ibite/public-capture.controller.js";
import { MttsFormAController } from "../mtts/form-a.controller.js";
import { MttsReportQueryController } from "../mtts/report-query.controller.js";
import { WorkshopFeasibilityFormController } from "../feasibility/workshop-form.controller.js";
import { InstitutionPointsController } from "../geo/institution-points.controller.js";
import {
  MicrozonificationController,
  PublicGeoLayersController,
} from "../geo/microzonification.controller.js";
import {
  SYNTHETIC_IBITE_FORM,
  SYNTHETIC_CAPTURE_KEY,
  type SyntheticIbiteForm,
} from "../ibite/capture-form.js";
import { DynamicModule, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CatalogsController } from "./catalogs.controller.js";

import { CatalogsService } from "./catalogs.service.js";

@Module({
  controllers: [
    CatalogsController,
    ResultsController,
    AssignmentsController,
    MyIbiteAssignmentsController,
    InstitutionalAuditController,
    IbiteCampaignControlController,
    IbiteStudentStartController,
    MttsFormAController,
    MttsReportQueryController,
    WorkshopFeasibilityFormController,
    InstitutionPointsController,
    MicrozonificationController,
    PublicGeoLayersController,
  ],
  providers: [CatalogsService],
})
export class CatalogsModule {
  static register(
    databaseUrl: string,
    syntheticIbiteForm?: SyntheticIbiteForm | readonly SyntheticIbiteForm[],
    syntheticCaptureKey?: Buffer,
  ): DynamicModule {
    return {
      module: CatalogsModule,
      imports: [AuthModule.register(databaseUrl)],
      controllers: syntheticIbiteForm
        ? [IbiteCaptureController, IbitePublicCaptureController]
        : [],
      providers: syntheticIbiteForm
        ? [
            {
              provide: SYNTHETIC_CAPTURE_KEY,
              useValue: syntheticCaptureKey
                ? Buffer.from(syntheticCaptureKey)
                : randomBytes(32),
            },
            {
              provide: SYNTHETIC_IBITE_FORM,
              useValue: Array.isArray(syntheticIbiteForm)
                ? syntheticIbiteForm
                : [syntheticIbiteForm],
            },
          ]
        : [],
    };
  }
}
import { randomBytes } from "node:crypto";
