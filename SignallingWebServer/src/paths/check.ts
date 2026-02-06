// Copyright Epic Games, Inc. All Rights Reserved.
import { SignallingServer } from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.7';
import { GameStateMessage } from '../types/GameStateMessage';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment */

/**
 * NOTE: This endpoint sends messages through the SIGNALING channel (WebSocket) to UE.
 *
 * Data channels are WebRTC peer-to-peer connections between browser players and UE,
 * not accessible directly from the signaling server. The signaling channel is the
 * correct way to send server-initiated messages to UE.
 *
 * To handle these messages in UE, implement a custom message handler in your
 * Pixel Streaming plugin that listens for your custom message types.
 */

export default function (signallingServer: SignallingServer) {
    const operations = {
        GET,
        POST
    };

    function GET(req: any, res: any, _next: any) {
        res.status(200).json({ message: 'Check endpoint is active!' });
    }

    function POST(req: any, res: any, _next: any) {
        const body = req.body;
        console.log('Received POST body:', body);
        const streamerId = body.streamerId as string | undefined;
        const message = body.message as GameStateMessage | undefined;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        let streamersToTarget = [];
        if (streamerId) {
            const streamer = signallingServer.streamerRegistry.find(streamerId);
            if (streamer) {
                streamersToTarget.push(streamer);
            } else {
                res.status(404).json({ error: `Streamer ${streamerId} not found` });
                return;
            }
        } else {
            streamersToTarget = signallingServer.streamerRegistry.streamers;
        }

        console.log(`Found ${streamersToTarget.length} streamer(s) to target`);

        streamersToTarget.forEach((streamer) => {
            console.log(`Sending message to streamer [${streamer.streamerId}]:`, JSON.stringify(message));
            streamer.sendMessage(message);
            console.log(`Message sent successfully to streamer [${streamer.streamerId}]`);
        });

        res.status(200).json({
            message: `Sent message to ${streamersToTarget.length} streamers`,
            targetCount: streamersToTarget.length,
            messageType: message.type,
            note:
                message.type !== 'ping' && message.type !== 'pong'
                    ? 'Custom message types require a handler implementation in UE to process this message'
                    : 'Standard ping/pong message will be handled by UE automatically'
        });
    }

    GET.apiDoc = {
        summary:
            'Check method to validate that sending information from signaling server to streamer is working.',
        operationId: 'getCheckStatus',
        security: [
            {
                ApiKeyAuth: []
            }
        ],
        responses: {
            200: {
                description: 'Check status',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    POST.apiDoc = {
        summary: 'Send command to UE streamers',
        operationId: 'sendCheckCommand',
        description:
            'Sends messages to UE streamers via the signaling channel. Custom message types require a handler implementation in UE.',
        security: [
            {
                ApiKeyAuth: []
            }
        ],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            streamerId: {
                                type: 'string',
                                description:
                                    'Optional streamer ID to target. If omitted, broadcasts to all streamers.'
                            },
                            message: {
                                type: 'object',
                                description:
                                    'The message object to send. Must have a "type" field. Custom types require UE handler implementation.',
                                additionalProperties: true,
                                example: {
                                    type: 'command',
                                    action: 'customAction',
                                    data: 'your custom data'
                                }
                            }
                        },
                        required: ['message']
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Command sent',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string'
                                },
                                targetCount: {
                                    type: 'number'
                                },
                                messageType: {
                                    type: 'string'
                                },
                                note: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }
            },
            400: {
                description: 'Bad request - message is required'
            },
            404: {
                description: 'Streamer not found'
            }
        }
    };

    return operations;
}
