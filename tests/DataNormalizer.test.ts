/*
 * Copyright (C) 2019 Sylvain Afchain
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { DataViewerNormalizer } from '../src/lib/DataViewerNormalizer'

var assert = require('assert');
describe('DataNormalizer', function () {
  describe('#normalize()', function () {
    it('should have flatten the data', function () {
      var data = [
        {
          "ID": 255,
          "Src": "172.17.0.1"
        },
        {
          "ID": 455,
          "Mask": "255.255.0.0"
        }
      ]

      var columns = ['ID', 'Src', 'Mask']
      var rows = [
        [255, "172.17.0.1", ""],
        [455, "", "255.255.0.0"]
      ]

      var dn = new DataViewerNormalizer()
      var normalized = dn.normalize(data)

      assert.deepEqual(normalized.columns, columns)
      assert.deepEqual(normalized.rows, rows)
    });
  });
});