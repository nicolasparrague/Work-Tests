public class BrokerStatusController {

    @TestVisible
    @AuraEnabled(cacheable=true)
    public static String getMemberCount() {

        Counts count = new Counts();

        count.total = [SELECT COUNT() FROM MemberPlan WHERE OwnerId = :UserInfo.getUserId()];
        count.totalUntilLastMonth = [SELECT COUNT() FROM MemberPlan WHERE OwnerId = :UserInfo.getUserId() AND CreatedDate < :Date.today().toStartOfMonth()];

        return JSON.serialize(count);
    }

    public class Counts {
        Integer total;
        Integer totalUntilLastMonth;
    }
}