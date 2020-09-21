import { ModuleContract, ServiceCollectionBuilder } from "@vladbasin/ts-dependencies";
import { ServiceIds as CommonServiceIds } from "@vladbasin/ts-services";
import { AnalyticsReporterContract } from '../Analytics/Contacts/AnalyticsReporterContract';
import { AnalyticsReporter } from '../Analytics/Services/AnalyticsReporter';
import { ServiceIds } from "./ServiceIds";

export class AnalyticsModule implements ModuleContract {
    public register(builder: ServiceCollectionBuilder): ServiceCollectionBuilder {
        return builder
            .add<AnalyticsReporterContract>(ServiceIds.analyticsReporter, AnalyticsReporter, [
                CommonServiceIds.monitor,
                ServiceIds.analyticsConfiguration,
            ]);
    }
}