@IsTest
private class BrokerStatusControllerTest {
  @IsTest
  static void itShouldReturnMemberCount() {
    // GIVEN there are members created in the last month
    Account member = new Account(Name = 'name');
    insert member;

    MemberPlan memberPlan1 = new MemberPlan(
      Name = 'first',
      MemberId = member.Id,
      CreatedDate = System.now().addMonths(-3)
    );
    MemberPlan memberPlan2 = new MemberPlan(
      Name = 'second',
      MemberId = member.Id,
      CreatedDate = System.now().addDays(-2)
    );
    insert new List<MemberPlan>{ memberPlan1, memberPlan2 };

    // WHEN method is run
    Test.startTest();
    Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(
      BrokerStatusController.getMemberCount()
    );
    Test.stopTest();

    // THEN member count should match
    Assert.areEqual(
      result.get('total'),
      2,
      'should be equal the total number of members'
    );
    Assert.areEqual(
      result.get('totalUntilLastMonth'),
      1,
      'should be equal the total number of members until last month'
    );
  }
}
