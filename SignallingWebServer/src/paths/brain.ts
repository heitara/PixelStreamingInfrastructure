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
        res.status(200).json({ message: 'Brain is active' });
    }

    function POST(req: any, res: any, _next: any) {
        const body = req.body;
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
            streamer.sendMessage(message);
        });

        res.status(200).json({
            message: `Sent message to ${streamersToTarget.length} streamers`,
            target_count: streamersToTarget.length
        });
    }

    GET.apiDoc = {
        summary: 'Check brain status',
        operationId: 'getBrainStatus',
        security: [
            {
                ApiKeyAuth: []
            }
        ],
        responses: {
            200: {
                description: 'Brain status',
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
        operationId: 'sendBrainCommand',
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
                                target_count: {
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
