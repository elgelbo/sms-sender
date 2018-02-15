console.log('yo')
$(document).ready(function() {
  const senders = $(".sender").each(function(index) {
    $(this).click(function(e) {
      e.preventDefault();
      $("[name='questionNum']").remove();
      const status = $(`[name='survey[${index}][status]']`).attr('checked', false);
      const open = $(`[name='survey[${index}][status]'][value='Open']`).attr('checked', true);
      if (index === 0) {
        $(`[name='survey[${index+1}][status]']`).attr('checked', false);
        $(`[name='survey[${index+1}][status]'][value='Pending']`).attr('checked', true);
      }
      if (index === 1) {
        $(`[name='survey[${index-1}][status]']`).attr('checked', false);
        $(`[name='survey[${index-1}][status]'][value='Closed']`).attr('checked', true);
      }
      $('<input />').attr('type', 'hidden')
        .attr('name', "questionNum")
        .attr('value', index)
        .appendTo(document.forms['admin']);
      document.forms['admin'].action = `question${index}`;
      document.forms['admin'].submit();
    });
  });

});
