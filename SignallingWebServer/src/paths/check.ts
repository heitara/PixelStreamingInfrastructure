// Copyright Epic Games, Inc. All Rights Reserved.
import { BaseMessage } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.7';
import { SignallingServer } from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.7';

/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-assignment */

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
        const message = body.message as BaseMessage | undefined;

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

        streamersToTarget.forEach((streamer) => {
            // streamer.sendMessage(message);
            console.log('Sending message to streamer:', streamer, message);
            console.log('Message as json:', JSON.stringify(message));
            streamer.protocol.sendMessage(message);
        });

        res.status(200).json({
            message: `Sent message to ${streamersToTarget.length} streamers`,
            targetCount: streamersToTarget.length
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
        summary: 'Send command to streamers',
        operationId: 'sendCheckCommand',
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
                                description: 'Optional streamer ID to target. If omitted, broadcasts to all.'
                            },
                            message: {
                                type: 'object',
                                description: 'The message object to send to the streamer(s).',
                                additionalProperties: true
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
                                }
                            }
                        }
                    }
                }
            },
            400: {
                description: 'Bad request'
            },
            404: {
                description: 'Streamer not found'
            }
        }
    };

    return operations;
}
