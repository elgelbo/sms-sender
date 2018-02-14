console.log('yo')
$(document).ready(function() {
  const senders = $(".sender").each(function(index) {
    console.log(index + ": " + $(this).text());
    $(this).click(function(e) {
      e.preventDefault();
      console.log("Clicked: " + $(this).attr("id"));
      document.forms['admin'].action=`question${index}`;
      document.forms['admin'].submit();
    });
  });
});
