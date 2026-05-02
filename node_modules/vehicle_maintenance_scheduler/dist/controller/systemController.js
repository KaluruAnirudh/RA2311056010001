export class SystemController {
    health(_request, response) {
        response.status(200).json({
            status: "ok",
            service: "vehicle_maintenance_scheduler"
        });
    }
}
