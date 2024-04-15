@IsTest
private class BrokerStatusControllerTest {
    @IsTest
    static void itShouldReturnMemberCount() {

        //Arrange
        Account mockAccount = new Account(Name = 'name');
        insert mockAccount;

        MemberPlan firstRecord = new MemberPlan(
            Name = 'firstName',
            MemberId = mockAccount.Id,
            CreatedDate = System.now().addMonths(-3)
        );
        insert firstRecord;
        MemberPlan secondRecord = new MemberPlan(
            Name = 'secondName',
            MemberId = mockAccount.Id,
            CreatedDate = System.now().addDays(-2)
        );
        insert secondRecord;

        // test
        Test.startTest();
            String MemberCount = BrokerStatusController.getMemberCount();
        Test.stopTest();

        //assert
        System.assertNotEquals(null, MemberCount, 'MemberCount cannot be null');
    }
}