<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $campaign->subject }}</title>
    <style>
        body { margin: 0; padding: 24px 12px; background: #f4f5f7; font-family: Arial, Helvetica, sans-serif; color: #212529; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; padding: 24px; line-height: 1.5; }
        h1 { font-size: 24px; margin: 0 0 16px; }
        p { margin: 0 0 16px; }
        img { max-width: 100%; height: auto; display: block; margin: 0 0 16px; }
        a { color: #0d6efd; }
        p > a:only-child { display: inline-block; padding: 10px 20px; background: #0d6efd; color: #ffffff; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="wrapper">
        {!! $bodyHtml !!}
    </div>
</body>
</html>
