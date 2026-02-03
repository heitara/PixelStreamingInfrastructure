# How to execute:
# hurl --variables-file .\local.env --very-verbose --no-output check.hurl
POST {{server}}/check
x-api-key: {{apiKey}}
{
    "streamerId": "DefaultStreamer",
    "message": {
        "type": "UIInteraction",
        "triggerScene": "Main",
        "descriptor": {
            "triggerScene": "Main",
            "Character": "Crunch",
            "command": "ChangeColor",
            "color": "Blue"
            
        }
    }
}
