console.log('yo')
// console.log(chartData);

if (chartData) {
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [chartData.Question1["0"].Labels["0"], chartData.Question1["0"].Labels["1"]],
      datasets: [{
        data: [chartData.Question1["1"].Data["0"], chartData.Question1["1"].Data["1"]],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  });
}

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
