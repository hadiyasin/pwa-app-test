console.log('I am running!');

$(document).ready(function(){
    console.log('Document ready!');

    $("#cropYearPicker").datepicker({
        format: "yyyy",
        viewMode: "years",
        startView: "years",
        minViewMode: "years",
        maxViewMode: "years",
        clearBtn: false,
        autoclose: true,
        todayHighlight: false,
        datesDisabled: [],
        toggleActive: true
    });

    $("#phoneNumberInput").intlTelInput({
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/8.4.6/js/utils.js"
      });

    $("#sbmt").click(function(){
        console.log('Clicked!');
        let emailSubject = 'Subject';
        let emailBody = 'Body';
        window.location.href = "mailto:support@example.com?subject=" + emailSubject + "&body=" + emailBody;
        return "_blank";
    });
});