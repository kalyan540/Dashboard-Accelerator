/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { rgb } from 'd3-color';

// eslint-disable-next-line import/prefer-default-export
export function hexToRGB(
  hex: string | undefined,
  alpha = 255,
): [number, number, number, number] {
  if (!hex) {
    return [0, 0, 0, alpha];
  }
  const { r, g, b } = rgb(hex);

  return [r, g, b, alpha];
}
