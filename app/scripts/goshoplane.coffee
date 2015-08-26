$(() ->
  $("#subscribe").click(() ->
    email = $("#email").val()
    $.ajax(
      type: 'POST'
      data: JSON.stringify(email: email)
      contentType: 'application/json'
      url: 'subscribe'
      success: (data) -> console.log(data)
    )
  )
)