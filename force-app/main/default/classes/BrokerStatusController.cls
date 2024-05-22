public with sharing class BrokerStatusController {
  @AuraEnabled(cacheable=true)
  public static String getMemberCount() {
    Counts counts = new Counts();

    counts.total = [
      SELECT COUNT()
      FROM MemberPlan
      WHERE OwnerId = :UserInfo.getUserId()
    ];
    counts.totalUntilLastMonth = [
      SELECT COUNT()
      FROM MemberPlan
      WHERE
        OwnerId = :UserInfo.getUserId()
        AND CreatedDate < :Date.today().toStartOfMonth()
    ];

    return JSON.serialize(counts);
  }

  private class Counts {
    Integer total;
    Integer totalUntilLastMonth;
  }
}