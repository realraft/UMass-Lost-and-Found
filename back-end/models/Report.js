// Report model definition
class Report {
    constructor({id, post_id, reason, reported_by, status = 'pending'}) {
        this.id = id;
        this.post_id = post_id;
        this.reason = reason;
        this.reported_by = reported_by;
        this.status = status;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export default Report;