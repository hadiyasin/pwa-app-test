console.log('I am running!');

$(document).ready(function(){
    console.log('Document ready!');
    $("#sbmt").click(function(){
        console.log('Clicked!');
        let emailSubject = 'Subject';
        let emailBody = 'Body';
        window.location.href = "mailto:support@example.com?subject=" + emailSubject + "&body=" + emailBody;
        // $(this).hide();
    });
});